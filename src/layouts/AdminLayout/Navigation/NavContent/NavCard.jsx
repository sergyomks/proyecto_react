import React from 'react';

// react-bootstrap
import { Card } from 'react-bootstrap';

// assets
import sidebarImages from '../../../../assets/images/sidebar.png';

// ==============================|| NAV CARD ||============================== //

let itemTarget = '_blank';

const NavCard = () => {
  return (
    <React.Fragment>
      <Card className="bg-transparent border">
        <Card.Body className="p-2 text-center">
          <img src={sidebarImages} className="img-radius " alt="User-Profile" />
          <h5>MATHIAZ</h5>
          <p>comercial mathiaz S.A.C</p>
          <a
            href="#"
            target={itemTarget}
            className="btn text-white btn-primary"
          >
            version 1.0.0
          </a>
        </Card.Body>
      </Card>
    </React.Fragment>
  );
};

export default NavCard;
