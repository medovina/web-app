import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Icon, { GroupIcon } from '../../icons';
import Button from '../../widgets/FlatButton';
import { getGroupCanonicalLocalizedName } from '../../../helpers/localizedData';
import { identity } from '../../../helpers/common';
import withLinks from '../../../helpers/withLinks';

const AssignmentFormMultiassignSuccess = ({
  assignedToGroups,
  groups,
  groupsAccessor,
  acknowledgeSuccess,
  intl: { locale },
  links: { GROUP_DETAIL_URI_FACTORY },
}) => (
  <React.Fragment>
    <div className="callout callout-success">
      <h4>
        <FormattedMessage id="app.multiAssignForm.successHeading" defaultMessage="Exercise Assigned" />
      </h4>
      <p>
        <FormattedMessage
          id="app.multiAssignForm.successDescription"
          defaultMessage="The exercise was successfuly assigned to the following groups."
        />
      </p>
    </div>
    <Table>
      <tbody>
        {assignedToGroups
          .map(gId => groups.find(({ id }) => id === gId))
          .filter(identity)
          .map(group => (
            <tr key={group.id}>
              <td className="text-nowrap shrink-col">
                <Icon icon="check" />
              </td>
              <td>{getGroupCanonicalLocalizedName(group, groupsAccessor, locale)}</td>
              <td className="text-right">
                <LinkContainer to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                  <Button bsSize="xs" bsStyle="primary" className="btn-flat">
                    <GroupIcon gapRight />
                    <FormattedMessage id="app.group.detail" defaultMessage="Group Detail" />
                  </Button>
                </LinkContainer>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>

    <div className="text-center">
      <Button bsStyle="warning" className="btn-flat" onClick={acknowledgeSuccess}>
        <Icon icon={['far', 'smile']} gapRight />
        <FormattedMessage id="generic.acknowledge" defaultMessage="Acknowledge" />
      </Button>
    </div>
  </React.Fragment>
);

AssignmentFormMultiassignSuccess.propTypes = {
  assignedToGroups: PropTypes.array.isRequired,
  groups: PropTypes.array.isRequired,
  groupsAccessor: PropTypes.func.isRequired,
  acknowledgeSuccess: PropTypes.func,
  intl: intlShape.isRequired,
  links: PropTypes.object.isRequired,
};

export default injectIntl(withLinks(AssignmentFormMultiassignSuccess));
