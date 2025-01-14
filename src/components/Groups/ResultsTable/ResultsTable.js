import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { defaultMemoize } from 'reselect';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import { safeGet, EMPTY_ARRAY, EMPTY_OBJ } from '../../../helpers/common';
import UsersName from '../../Users/UsersName';
import SortableTable, { SortableTableColumnDescriptor } from '../../widgets/SortableTable';
import withLinks from '../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { getLocalizedName } from '../../../helpers/localizedData';
import { createUserNameComparator } from '../../helpers/users';
import { compareAssignments, compareShadowAssignments } from '../../helpers/assignments';
import { downloadString } from '../../../redux/helpers/api/download';
import Button from '../../widgets/FlatButton';
import { DownloadIcon } from '../../icons';

import styles from './ResultsTable.less';
import escapeString from '../../helpers/escapeString';

const assignmentCellRendererCreator = defaultMemoize((rawAssignments, locale) => {
  const assignments = {};
  rawAssignments.forEach(a => (assignments[a.id] = a));
  return (points, idx, key, row) => (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={`results-table-cell-${row.user.id}-${idx}`}>
          {row.user.name.firstName} {row.user.name.lastName}
          {', '}
          {assignments[key] && getLocalizedName(assignments[key], locale)}
        </Tooltip>
      }>
      <span>
        {points && Number.isInteger(points.gained) ? (
          <span>
            {points.gained}
            {points.bonus > 0 && <span className={styles.bonusPoints}>+{points.bonus}</span>}
            {points.bonus < 0 && <span className={styles.malusPoints}>{points.bonus}</span>}
          </span>
        ) : (
          '-'
        )}
      </span>
    </OverlayTrigger>
  );
});

// Prepare data in CSV format
const getCSVValues = (assignments, shadowAssignments, data, locale) => {
  const QUOTE = '"';
  const SEPARATOR = ';';
  const NEWLINE = '\n';
  const result = [];

  const enquote = string => `${QUOTE}${string}${QUOTE}`;

  const header = [enquote('userName'), enquote('userEmail'), enquote('totalPoints')];
  assignments.forEach(assignment => {
    header.push(enquote(escapeString(getLocalizedName(assignment, locale))));
  });
  shadowAssignments.forEach(shadowAssignment => {
    header.push(enquote(escapeString(getLocalizedName(shadowAssignment, locale))));
  });
  result.push(header);

  data.forEach(item => {
    const row = [
      enquote(`${escapeString(item.user.fullName)}`),
      item.user.privateData ? enquote(`${escapeString(item.user.privateData.email)}`) : '',
      item.total.gained,
    ];
    assignments.forEach(assignment => {
      if (!Number.isInteger(item[assignment.id].gained)) {
        row.push('');
      } else {
        const gainedPoints = item[assignment.id].gained;
        const bonusPoints = item[assignment.id].bonus;
        if (Number.isInteger(bonusPoints)) {
          if (bonusPoints > 0) {
            row.push(`${gainedPoints}+${bonusPoints}`);
          } else if (bonusPoints < 0) {
            row.push(`${gainedPoints}${bonusPoints}`); // minus sign comes with the bonusPoints value
          } else {
            row.push(gainedPoints);
          }
        }
      }
    });
    shadowAssignments.forEach(shadowAssignment => {
      row.push(Number.isInteger(item[shadowAssignment.id].gained) ? item[shadowAssignment.id].gained : '');
    });
    result.push(row);
  });

  // get string from arrays
  return result.map(row => row.join(SEPARATOR)).join(NEWLINE);
};

class ResultsTable extends Component {
  prepareColumnDescriptors = defaultMemoize((assignments, shadowAssignments, loggedUser, locale) => {
    const {
      isAdmin,
      isSupervisor,
      links: { ASSIGNMENT_STATS_URI_FACTORY, ASSIGNMENT_DETAIL_URI_FACTORY, SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY },
    } = this.props;

    const nameComparator = createUserNameComparator(locale);

    /*
     * User Name (First Column)
     */
    const columns = [
      new SortableTableColumnDescriptor('user', <FormattedMessage id="generic.nameOfPerson" defaultMessage="Name" />, {
        headerSuffix: <FormattedMessage id="app.groupResultsTable.maxPointsRow" defaultMessage="Max points:" />,
        headerSuffixClassName: styles.maxPointsRow,
        className: 'text-left',
        comparator: ({ user: u1 }, { user: u2 }) => nameComparator(u1, u2),
        cellRenderer: user =>
          user && <UsersName {...user} currentUserId={loggedUser.id} showEmail="icon" showExternalIdentifiers />,
      }),
    ];

    /*
     * Assignments
     */
    assignments.sort(compareAssignments).forEach(assignment =>
      columns.push(
        new SortableTableColumnDescriptor(
          assignment.id,
          (
            <div className={styles.verticalText}>
              <div>
                <Link
                  to={
                    isAdmin || isSupervisor
                      ? ASSIGNMENT_STATS_URI_FACTORY(assignment.id)
                      : ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)
                  }>
                  <LocalizedExerciseName entity={assignment} />
                </Link>
              </div>
            </div>
          ),
          {
            className: 'text-center',
            headerSuffix:
              assignment.maxPointsBeforeFirstDeadline +
              (assignment.maxPointsBeforeSecondDeadline ? ` / ${assignment.maxPointsBeforeSecondDeadline}` : ''),
            headerSuffixClassName: styles.maxPointsRow,
            cellRenderer: assignmentCellRendererCreator(assignments, locale),
          }
        )
      )
    );

    /*
     * Shadow Assignments
     */
    shadowAssignments.sort(compareShadowAssignments).forEach(shadowAssignment =>
      columns.push(
        new SortableTableColumnDescriptor(
          shadowAssignment.id,
          (
            <div className={styles.verticalText}>
              <div>
                <Link to={SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(shadowAssignment.id)}>
                  <LocalizedExerciseName entity={shadowAssignment} />
                </Link>
              </div>
            </div>
          ),
          {
            className: 'text-center',
            headerSuffix: shadowAssignment.maxPoints,
            headerSuffixClassName: styles.maxPointsRow,
            cellRenderer: points => (points && Number.isInteger(points.gained) ? <span>{points.gained}</span> : '-'),
          }
        )
      )
    );

    /*
     * Total points and optionally buttons
     */
    columns.push(
      new SortableTableColumnDescriptor(
        'total',
        <FormattedMessage id="app.resultsTable.total" defaultMessage="Total" />,
        {
          className: 'text-center',
          headerSuffixClassName: styles.maxPointsRow,
          comparator: ({ total: t1, user: u1 }, { total: t2, user: u2 }) =>
            (Number(t2 && t2.gained) || -1) - (Number(t1 && t1.gained) || -1) || nameComparator(u1, u2),
          cellRenderer: points => <strong>{points ? `${points.gained}/${points.total}` : '-/-'}</strong>,
        }
      )
    );

    if (isAdmin) {
      columns.push(
        new SortableTableColumnDescriptor('buttons', '', {
          headerSuffixClassName: styles.maxPointsRow,
          className: 'text-right',
        })
      );
    }

    return columns;
  });

  // Re-format the data, so they can be rendered by the SortableTable ...
  prepareData = defaultMemoize((assignments, shadowAssignments, users, stats) => {
    const { isAdmin, isSupervisor, loggedUser, publicStats, renderActions } = this.props;

    if (!isAdmin && !isSupervisor && !publicStats) {
      users = users.filter(({ id }) => id === loggedUser.id);
    }

    return users.map(user => {
      const userStats = stats.find(stat => stat.userId === user.id);
      const data = {
        id: user.id,
        user: user,
        total: userStats && userStats.points,
        buttons: renderActions && isAdmin ? renderActions(user.id) : '',
      };

      assignments.forEach(assignment => {
        data[assignment.id] = safeGet(userStats, ['assignments', a => a.id === assignment.id, 'points'], EMPTY_OBJ);
      });

      shadowAssignments.forEach(shadowAssignment => {
        data[shadowAssignment.id] = safeGet(
          userStats,
          ['shadowAssignments', a => a.id === shadowAssignment.id, 'points'],
          EMPTY_OBJ
        );
      });

      return data;
    });
  });

  render() {
    const {
      assignments = EMPTY_ARRAY,
      shadowAssignments = EMPTY_ARRAY,
      users = EMPTY_ARRAY,
      loggedUser,
      stats,
      isAdmin,
      isSupervisor,
      groupName,
      intl: { locale },
    } = this.props;

    return (
      <React.Fragment>
        <SortableTable
          hover
          columns={this.prepareColumnDescriptors(assignments, shadowAssignments, loggedUser, locale)}
          defaultOrder="user"
          data={this.prepareData(assignments, shadowAssignments, users, stats)}
          empty={
            <div className="text-center text-muted">
              <FormattedMessage
                id="app.groupResultsTableRow.noStudents"
                defaultMessage="There are currently no students in the group."
              />
            </div>
          }
        />
        {(isAdmin || isSupervisor) && (
          <div className="text-center">
            <Button
              bsStyle="primary"
              className={styles.downloadButton}
              onClick={() =>
                downloadString(
                  `${groupName}.csv`,
                  getCSVValues(
                    assignments,
                    shadowAssignments,
                    this.prepareData(assignments, shadowAssignments, users, stats),
                    locale
                  ),
                  'text/csv;charset=utf-8',
                  true // add BOM
                )
              }>
              <DownloadIcon gapRight />
              <FormattedMessage id="app.groupResultsTable.downloadCSV" defaultMessage="Download results as CSV" />
            </Button>
          </div>
        )}
      </React.Fragment>
    );
  }
}

ResultsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  shadowAssignments: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  loggedUser: PropTypes.object.isRequired,
  stats: PropTypes.array.isRequired,
  publicStats: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  renderActions: PropTypes.func,
  groupName: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  links: PropTypes.object,
};

export default withLinks(injectIntl(ResultsTable));
