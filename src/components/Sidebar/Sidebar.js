import React, { PropTypes } from 'react';

import Badge from '../Badge/Badge';
import SidebarMenuTitle from '../SidebarMenuTitle/SidebarMenuTitle';
import SidebarMenuItem from '../SidebarMenuItem/SidebarMenuItem';
import SidebarMenuGroup from '../SidebarMenuGroup/SidebarMenuGroup';

const Sidebar = ({
  user = {
    name: 'Simon Rozsival',
    email: 'simon.rozsival@gmail.com',
    institution: 'MFF UK v Praze'
  },
  groups = [
    { id: 1, name: 'Programování I', abbr: 'P1', color: '#123' },
    { id: 2, name: 'Programování II', abbr: 'P2', color: '#321', notificationsCount: 2 },
    { id: 3, name: 'Jazyk C# a programovani pro .NET', abbr: 'C#', color: '#222' }
  ],
  createSelectGroupLink = item => `/group/${item.id}`,
  isActive = link => link === '/'
}) => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      {user &&
        <Badge
          name={user.name}
          email={user.email}
          description={user.institution} />}

      <ul className='sidebar-menu'>
        <SidebarMenuTitle title={'Menu'} />
        <SidebarMenuGroup
          title='Skupiny'
          items={groups}
          isActive={groups.some(item => isActive(createSelectGroupLink(item)))}
          createLink={createSelectGroupLink} />
      </ul>
    </section>
  </aside>
);

Sidebar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    institution: PropTypes.string
  }),
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      name: PropTypes.string.isRequired,
      abbr: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  )
};

export default Sidebar;
