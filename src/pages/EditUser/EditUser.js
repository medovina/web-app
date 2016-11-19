import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { fetchUserIfNeeded, updateProfile, updateSettings } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import Page from '../../components/Page';

import EditUserProfileForm from '../../components/Forms/EditUserProfileForm';
import EditUserSettingsForm from '../../components/Forms/EditUserSettingsForm';

class EditUser extends Component {

  static loadAsync = ({ userId }, dispatch) => Promise.all([
    dispatch(fetchUserIfNeeded(userId))
  ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.userId !== newProps.params.userId) {
      newProps.loadAsync();
    }
  }

  render() {
    const { user } = this.props;
    return (
      <Page
        resource={user}
        title={(user) => user.fullName}
        description={<FormattedMessage id='app.editUser.description' defaultMessage="Edit user's profile" />}
        breadcrumbs={[
          {
            resource: user,
            iconName: 'user',
            breadcrumb: (user) => ({
              text: <FormattedMessage id='app.user.title' />,
              link: ({ USER_URI_FACTORY }) => USER_URI_FACTORY(user.id)
            })
          },
          {
            text: <FormattedMessage id='app.editUser.title' defaultMessage="Edit user's profile" />,
            iconName: 'pencil'
          }
        ]}>
        {data => (
          <div>
            <EditUserProfileForm
              onSubmit={updateProfile}
              initialValues={data} />
            <EditUserSettingsForm
              onSubmit={updateSettings}
              initialValues={data.settings} />
          </div>
        )}
      </Page>
    );
  }

}

EditUser.propTypes = {
  user: ImmutablePropTypes.map,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { userId } }) => ({
    user: getUser(userId)(state)
  }),
  (dispatch, { params }) => ({
    loadAsync: () => EditUser.loadAsync(params, dispatch)
  })
)(EditUser);
