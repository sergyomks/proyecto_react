import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col, ProgressBar, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FiLock, FiAlertTriangle, FiMail, FiEye, FiEyeOff, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida')
});

const MAX_ATTEMPTS = 5;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let interval;
    if (isLocked && lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setAttemptsRemaining(MAX_ATTEMPTS);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimeRemaining]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');

    if (isLocked) {
      setError(`Cuenta bloqueada. Espere ${formatTime(lockTimeRemaining)}`);
      setSubmitting(false);
      return;
    }

    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        const errorMsg = result.error || 'Error al iniciar sesión';

        if (errorMsg.includes('bloqueada') || errorMsg.includes('Cuenta bloqueada')) {
          setIsLocked(true);
          const minutesMatch = errorMsg.match(/(\d+)\s*minutos?/);
          if (minutesMatch) {
            setLockTimeRemaining(parseInt(minutesMatch[1]) * 60);
          } else {
            setLockTimeRemaining(15 * 60);
          }
        }

        const attemptsMatch = errorMsg.match(/Intentos restantes:\s*(\d+)/);
        if (attemptsMatch) {
          setAttemptsRemaining(parseInt(attemptsMatch[1]));
        } else if (!isLocked) {
          setAttemptsRemaining((prev) => Math.max(0, prev - 1));
        }

        setError(errorMsg);
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  // Estilos inline para el diseño
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    leftPanel: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px 0 0 20px',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      minHeight: '500px'
    },
    rightPanel: {
      background: 'white',
      borderRadius: '0 20px 20px 0',
      padding: '40px',
      minHeight: '500px'
    },
    mobileCard: {
      background: 'white',
      borderRadius: '20px',
      padding: '30px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
    },
    logo: {
      width: '80px',
      height: '80px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '20px'
    },
    inputIcon: {
      background: 'transparent',
      borderRight: 'none',
      color: '#667eea'
    },
    input: {
      borderLeft: 'none',
      paddingLeft: '0'
    },
    submitBtn: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      padding: '12px',
      fontWeight: '600',
      borderRadius: '10px'
    },
    feature: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '15px',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Versión Desktop */}
      <Card className="shadow-lg border-0 d-none d-lg-flex" style={{ maxWidth: '900px', width: '100%', overflow: 'hidden' }}>
        <Row className="g-0">
          {/* Panel Izquierdo - Branding */}
          <Col lg={5} style={styles.leftPanel}>
            <div style={styles.logo}>
              <FiShoppingBag size={40} />
            </div>
            <h2 className="fw-bold mb-3 text-center">Comercial MATHIAZ</h2>
            <p className="text-center opacity-75 mb-4">Sistema de Facturación Electrónica</p>

            <div className="mt-4">
              <div style={styles.feature}>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FiShoppingBag size={16} />
                </div>
                <span>Gestión de productos y tallas</span>
              </div>
              <div style={styles.feature}>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FiShoppingBag size={16} />
                </div>
                <span>Punto de venta rápido</span>
              </div>
              <div style={styles.feature}>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FiShoppingBag size={16} />
                </div>
                <span>Boletas y facturas electrónicas</span>
              </div>
              <div style={styles.feature}>
                <div className="bg-white bg-opacity-25 rounded-circle p-2">
                  <FiShoppingBag size={16} />
                </div>
                <span>Reportes y dashboard</span>
              </div>
            </div>
          </Col>

          {/* Panel Derecho - Formulario */}
          <Col lg={7} style={styles.rightPanel}>
            <div className="h-100 d-flex flex-column justify-content-center">
              <h3 className="fw-bold mb-1" style={{ color: '#333' }}>
                Bienvenido
              </h3>
              <p className="text-muted mb-4">Ingresa tus credenciales para continuar</p>

              {renderAlerts()}
              {renderForm()}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Versión Mobile */}
      <div className="d-lg-none w-100" style={{ maxWidth: '400px' }}>
        <div style={styles.mobileCard}>
          <div className="text-center mb-4">
            <div
              className="mx-auto mb-3"
              style={{
                ...styles.logo,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              <FiShoppingBag size={35} color="white" />
            </div>
            <h4 className="fw-bold" style={{ color: '#333' }}>
              Comercial MATHIAZ
            </h4>
            <p className="text-muted small">Sistema de Facturación</p>
          </div>

          {renderAlerts()}
          {renderForm()}
        </div>
      </div>
    </div>
  );

  // Función para renderizar alertas
  function renderAlerts() {
    return (
      <>
        {/* Alerta de cuenta bloqueada */}
        {isLocked && (
          <Alert variant="danger" className="text-center border-0" style={{ borderRadius: '10px' }}>
            <div className="mb-2">
              <div className="mx-auto bg-danger bg-opacity-10 rounded-circle d-inline-flex p-3">
                <FiLock size={24} className="text-danger" />
              </div>
            </div>
            <h6 className="mb-2 fw-bold">Cuenta Bloqueada</h6>
            <p className="mb-2 small">Demasiados intentos fallidos.</p>
            <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
              <span className="small">Tiempo restante:</span>
              <strong className="fs-5 text-danger">{formatTime(lockTimeRemaining)}</strong>
            </div>
            <ProgressBar now={(lockTimeRemaining / (15 * 60)) * 100} variant="danger" style={{ height: '6px', borderRadius: '3px' }} />
          </Alert>
        )}

        {/* Alerta de error normal */}
        {error && !isLocked && (
          <Alert variant="danger" onClose={() => setError('')} dismissible className="border-0" style={{ borderRadius: '10px' }}>
            <div className="d-flex align-items-center gap-2">
              <FiAlertTriangle />
              <span className="small">{error}</span>
            </div>
          </Alert>
        )}

        {/* Indicador de intentos restantes */}
        {!isLocked && attemptsRemaining < MAX_ATTEMPTS && attemptsRemaining > 0 && (
          <Alert variant="warning" className="py-2 border-0" style={{ borderRadius: '10px' }}>
            <small className="d-flex align-items-center gap-1">
              <FiAlertTriangle />
              Intentos restantes: <strong>{attemptsRemaining}</strong> de {MAX_ATTEMPTS}
            </small>
            <ProgressBar
              now={(attemptsRemaining / MAX_ATTEMPTS) * 100}
              variant={attemptsRemaining <= 2 ? 'danger' : 'warning'}
              className="mt-1"
              style={{ height: '4px', borderRadius: '2px' }}
            />
          </Alert>
        )}
      </>
    );
  }

  // Función para renderizar el formulario
  function renderForm() {
    return (
      <Formik initialValues={{ email: '', password: '' }} validationSchema={loginSchema} onSubmit={handleSubmit}>
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit: formikSubmit, isSubmitting }) => (
          <Form onSubmit={formikSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Correo electrónico</Form.Label>
              <InputGroup>
                <InputGroup.Text style={styles.inputIcon}>
                  <FiMail />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.email && errors.email}
                  style={{ ...styles.input, borderRadius: '0 8px 8px 0' }}
                  disabled={isLocked}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold text-muted">Contraseña</Form.Label>
              <InputGroup>
                <InputGroup.Text style={styles.inputIcon}>
                  <FiLock />
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isInvalid={touched.password && errors.password}
                  style={styles.input}
                  disabled={isLocked}
                />
                <InputGroup.Text
                  style={{ ...styles.inputIcon, cursor: 'pointer', borderLeft: 'none' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Button type="submit" className="w-100 mb-3" style={styles.submitBtn} disabled={isSubmitting || isLocked}>
              {isLocked ? (
                <>
                  <FiLock className="me-2" />
                  Bloqueado ({formatTime(lockTimeRemaining)})
                </>
              ) : isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            <div className="text-center">
              <small className="text-muted">© 2024 Tienda de Poleras - Sistema de Facturación</small>
            </div>
          </Form>
        )}
      </Formik>
    );
  }
};

export default Login;
