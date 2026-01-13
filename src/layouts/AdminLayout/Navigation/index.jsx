import React, { useContext, useMemo } from 'react';

// project import
import { ConfigContext } from '../../../contexts/ConfigContext';
import { useAuth } from '../../../contexts/AuthContext';
import useWindowSize from '../../../hooks/useWindowSize';
import { filterMenuByRole } from '../../../utils/menuFilter';

import NavContent from './NavContent';
import navigation from '../../../menu-items';

// ==============================|| NAVIGATION ||============================== //

const Navigation = () => {
  const configContext = useContext(ConfigContext);
  const { layoutType, collapseMenu } = configContext.state;
  const windowSize = useWindowSize();
  const { user } = useAuth();

  // Filtrar menú según el rol del usuario
  const filteredNavigation = useMemo(() => {
    const userRole = user?.rol || null;
    return filterMenuByRole(navigation.items, userRole);
  }, [user?.rol]);

  const scroll = () => {
    document.querySelector('.pcoded-navbar').removeAttribute('style');
  };

  let navClass = ['pcoded-navbar', layoutType];
  navClass = [...navClass, 'menupos-fixed'];
  window.removeEventListener('scroll', scroll, false);

  if (windowSize.width < 992 && collapseMenu) {
    navClass = [...navClass, 'mob-open'];
  } else if (collapseMenu) {
    navClass = [...navClass, 'navbar-collapsed'];
  }

  let navBarClass = ['navbar-wrapper'];
  let navContent = (
    <div className={navBarClass.join(' ')}>
      <NavContent navigation={filteredNavigation} />
    </div>
  );
  if (windowSize.width < 992) {
    navContent = (
      <div className="navbar-wrapper">
        <NavContent navigation={filteredNavigation} />
      </div>
    );
  }
  return (
    <React.Fragment>
      <nav className={navClass.join(' ')}>{navContent}</nav>
    </React.Fragment>
  );
};

export default Navigation;
