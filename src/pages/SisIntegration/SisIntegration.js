import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';

import PageContent from '../../components/layout/PageContent';
import { isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import {
  fetchAllTerms,
  create,
  deleteTerm
} from '../../redux/modules/sisTerms';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import {
  fetchManyStatus,
  readySisTermsSelector
} from '../../redux/selectors/sisTerms';
import AddSisTermForm from '../../components/forms/AddSisTermForm/AddSisTermForm';
import TermsList from '../../components/SisIntegration/TermsList/TermsList';
import Box from '../../components/widgets/Box/Box';
import Confirm from '../../components/forms/Confirm';
import { DeleteIcon } from '../../components/icons';

class SisIntegration extends Component {
  static loadAsync = (params, dispatch, userId, isSuperAdmin) =>
    Promise.all([dispatch(fetchAllTerms)]);

  componentWillMount() {
    const { loadAsync, userId, isSuperAdmin } = this.props;
    loadAsync(userId, isSuperAdmin);
  }

  render() {
    const { fetchStatus, createNewTerm, deleteTerm, sisTerms } = this.props;

    return (
      <PageContent
        title={
          <FormattedMessage
            id="app.sisIntegration.title"
            defaultMessage="SIS Integration"
          />
        }
        description={
          <FormattedMessage
            id="app.sisIntegration.description"
            defaultMessage="Integration with university SIS system"
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage
                id="app.sisIntegration.title"
                defaultMessage="SIS Integration"
              />
            ),
            iconName: 'id-badge'
          }
        ]}
      >
        <Row>
          <Col lg={8}>
            <FetchManyResourceRenderer fetchManyStatus={fetchStatus}>
              {() =>
                <Box
                  title={
                    <FormattedMessage
                      id="app.sisIntegration.list"
                      defaultMessage="SIS Terms"
                    />
                  }
                  noPadding
                  unlimitedHeight
                >
                  <TermsList
                    terms={sisTerms}
                    createActions={id =>
                      <div>
                        <Confirm
                          id={id}
                          onConfirmed={() => deleteTerm(id)}
                          question={
                            <FormattedMessage
                              id="app.sisIntegration.deleteConfirm"
                              defaultMessage="Are you sure you want to delete the SIS term?"
                            />
                          }
                        >
                          <Button
                            bsSize="xs"
                            className="btn-flat"
                            bsStyle="danger"
                          >
                            <DeleteIcon />{' '}
                            <FormattedMessage
                              id="app.sisIntegration.deleteButton"
                              defaultMessage="Delete"
                            />
                          </Button>
                        </Confirm>
                      </div>}
                  />
                </Box>}
            </FetchManyResourceRenderer>
          </Col>
          <Col lg={4}>
            <AddSisTermForm onSubmit={createNewTerm} />
          </Col>
        </Row>
      </PageContent>
    );
  }
}

SisIntegration.propTypes = {
  userId: PropTypes.string.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired,
  loadAsync: PropTypes.func.isRequired,
  fetchStatus: PropTypes.string,
  createNewTerm: PropTypes.func,
  deleteTerm: PropTypes.func,
  sisTerms: PropTypes.array.isRequired
};

const mapStateToProps = state => {
  return {
    userId: loggedInUserIdSelector(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    fetchStatus: fetchManyStatus(state),
    sisTerms: readySisTermsSelector(state)
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  loadAsync: (userId, isSuperAdmin) =>
    SisIntegration.loadAsync(params, dispatch, userId, isSuperAdmin),
  createNewTerm: data => dispatch(create(data)),
  deleteTerm: id => dispatch(deleteTerm(id))
});

export default connect(mapStateToProps, mapDispatchToProps)(SisIntegration);
