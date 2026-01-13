import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFolder } from 'react-icons/fi';
import { categoriasApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { confirmDeletePermanent, toastSuccess, toastError } from '../../utils/alerts';
import CategoryForm from './CategoryForm';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const tree = await categoriasApi.getArbol();
      const flatList = flattenTree(tree);
      setCategories(flatList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const flattenTree = (nodes, level = 0) => {
    let result = [];
    nodes.forEach((node) => {
      result.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, level + 1));
      }
    });
    return result;
  };

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return cat.nombre.toLowerCase().includes(query);
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    const confirmed = await confirmDeletePermanent(category.nombre);
    if (!confirmed) return;
    try {
      await categoriasApi.delete(category.id);
      toastSuccess('Categoría eliminada');
      loadCategories();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    loadCategories();
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Gestión de Categorías</h5>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <FiPlus className="me-1" /> Nueva Categoría
          </Button>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <InputGroup className="mb-3" style={{ maxWidth: '300px' }}>
            <InputGroup.Text>
              <FiSearch />
            </InputGroup.Text>
            <Form.Control placeholder="Buscar categorías..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </InputGroup>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Cargando...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No se encontraron categorías
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span style={{ paddingLeft: `${category.level * 20}px` }}>
                        <FiFolder className="me-2 text-warning" />
                        {category.nombre}
                        {!category.activo && (
                          <Badge bg="secondary" className="ms-2">
                            Inactivo
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td>{category.descripcion || '-'}</td>
                    <td>
                      <Badge bg="secondary">{category.productCount || 0}</Badge>
                    </td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(category)}>
                        <FiEdit2 />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(category)}
                        disabled={category.productCount > 0}
                        title={category.productCount > 0 ? 'Tiene productos asociados' : 'Eliminar'}
                      >
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CategoryForm category={editingCategory} onSave={handleSave} onCancel={() => setShowModal(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CategoryList;
