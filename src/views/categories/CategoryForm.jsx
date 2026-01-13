import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { categoriasApi } from '../../services/api';

const categorySchema = Yup.object().shape({
  nombre: Yup.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres').required('El nombre es requerido'),
  descripcion: Yup.string().max(300, 'Máximo 300 caracteres'),
  parentId: Yup.number().nullable()
});

const CategoryForm = ({ category, onSave, onCancel }) => {
  const [error, setError] = useState('');
  const [parentCategories, setParentCategories] = useState([]);
  const isEditing = !!category;

  useEffect(() => {
    const loadParentCategories = async () => {
      try {
        const categories = await categoriasApi.getAll();
        // Filtrar la categoría actual para evitar ciclos
        const filtered = categories.filter((c) => c.id !== category?.id);
        setParentCategories(filtered);
      } catch (err) {
        console.error('Error cargando categorías:', err);
      }
    };
    loadParentCategories();
  }, [category]);

  const initialValues = {
    nombre: category?.nombre || '',
    descripcion: category?.descripcion || '',
    parentId: category?.parentId || ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    try {
      const data = {
        nombre: values.nombre,
        descripcion: values.descripcion,
        parentId: values.parentId ? parseInt(values.parentId) : null
      };

      if (isEditing) {
        await categoriasApi.update(category.id, data);
      } else {
        await categoriasApi.create(data);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik initialValues={initialValues} validationSchema={categorySchema} onSubmit={handleSubmit}>
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
              placeholder="Ej: Hombre, Dama, Niños..."
            />
            <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="descripcion"
              value={values.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              isInvalid={touched.descripcion && errors.descripcion}
              placeholder="Descripción opcional de la categoría"
            />
            <Form.Control.Feedback type="invalid">{errors.descripcion}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Categoría Padre (opcional)</Form.Label>
            <Form.Select name="parentId" value={values.parentId} onChange={handleChange} onBlur={handleBlur}>
              <option value="">Sin categoría padre (raíz)</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">Selecciona una categoría padre para crear una subcategoría</Form.Text>
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

export default CategoryForm;
