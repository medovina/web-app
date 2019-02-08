import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { Link } from 'react-router';
import { changeLanguage } from '../../../links';

const HeaderLanguageSwitching = ({ currentUrl, lang, active = false }) => (
  <li className={classnames({ active })}>
    <Link to={changeLanguage(currentUrl, lang)}>{lang}</Link>
  </li>
);

HeaderLanguageSwitching.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  active: PropTypes.bool,
};

export default HeaderLanguageSwitching;
