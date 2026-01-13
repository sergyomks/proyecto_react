import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { usuariosApi } from '../../services/api';
import { ROLES } from '../../config/constant';

const createSchema = Yup.object().shape({
  nombre: Yup.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres').required('El nombre es requerido'),
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es requerida'),
  rol: Yup.string().oneOf(Object.values(ROLES)).required('El rol es requerido')
});

const updateSchema = Yup.object().shape({
  nombre: Yup.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres').required('El nombre es requerido'),
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres'),
  rol: Yup.string().oneOf(Object.values(ROLES)).required('El rol es requerido')
});

const UserForm = ({ user, onSave, onCancel }) => {
  const [error, setError] = useState('');
  const isEditing = !!user;

  const initialValues = {
    nombre: user?.nombre || '',
    email: user?.email || '',
    password: '',
    rol: user?.rol || ROLES.VENDEDOR
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      const data = {
        nombre: values.nombre,
        email: values.email,
        rol: values.rol
      };

      if (values.password) {
        data.password = values.password;
      }

      if (isEditing) {
        await usuariosApi.update(user.id, data);
      } else {
        await usuariosApi.create(data);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={isEditing ? updateSchema : createSchema} onSubmit={handleSubmit}>
      {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={values.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.nombre && errors.nombre}
              placeholder="Nombre completo"
            />
            <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.email && errors.email}
              placeholder="correo@ejemplo.com"
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{isEditing ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.password && errors.password}
              placeholder="••••••••"
            />
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Rol *</Form.Label>
            <Form.Select name="rol" value={values.rol} onChange={handleChange} onBlur={handleBlur} isInvalid={touched.rol && errors.rol}>
              <option value={ROLES.ADMIN}>Administrador</option>
              <option value={ROLES.VENDEDOR}>Vendedor</option>
              <option value={ROLES.CAJERO}>Cajero</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.rol}</Form.Control.Feedback>
            <Form.Text className="text-muted">Admin: acceso total | Vendedor: ventas y productos | Cajero: solo POS</Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;
