import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Badge, Form, InputGroup, Modal, Spinner, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit2, FiUserX, FiUserCheck, FiSearch } from 'react-icons/fi';
import { usuariosApi } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import UserForm from './UserForm';
import { confirmAction, toastSuccess, toastError } from '../../utils/alerts';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosApi.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return user.nombre.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.rol.toLowerCase().includes(query);
  });

  const handleCreate = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleToggleStatus = async (user) => {
    const accion = user.activo ? 'desactivar' : 'activar';
    const confirmed = await confirmAction({
      title: `¿${user.activo ? 'Desactivar' : 'Activar'} usuario?`,
      text: `Se va a ${accion} al usuario "${user.nombre}"`,
      confirmText: `Sí, ${accion}`,
      icon: user.activo ? 'warning' : 'question',
      confirmButtonColor: user.activo ? '#dc3545' : '#28a745'
    });
    if (!confirmed) return;

    try {
      if (user.activo) {
        await usuariosApi.desactivar(user.id);
      } else {
        await usuariosApi.activar(user.id);
      }
      toastSuccess(`Usuario ${user.activo ? 'desactivado' : 'activado'}`);
      loadUsers();
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleSave = () => {
    setShowModal(false);
    loadUsers();
  };

  const getRoleBadge = (rol) => {
    const variants = {
      ADMIN: 'primary',
      VENDEDOR: 'success',
      CAJERO: 'info'
    };
    const labels = {
      ADMIN: 'Administrador',
      VENDEDOR: 'Vendedor',
      CAJERO: 'Cajero'
    };
    return <Badge bg={variants[rol] || 'secondary'}>{labels[rol] || rol}</Badge>;
  };

  return (
    <>
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Gestión de Usuarios</h5>
          <Button variant="primary" size="sm" onClick={handleCreate}>
            <FiPlus className="me-1" /> Nuevo Usuario
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
            <Form.Control placeholder="Buscar usuarios..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </InputGroup>

          <Table responsive hover>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último Login</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <Spinner animation="border" size="sm" /> Cargando...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.rol)}</td>
                    <td>
                      <Badge bg={user.activo ? 'success' : 'danger'}>{user.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td>{user.ultimoLogin ? formatDate(user.ultimoLogin, 'dd/MM/yyyy HH:mm') : '-'}</td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-1" onClick={() => handleEdit(user)}>
                        <FiEdit2 />
                      </Button>
                      <Button
                        variant={user.activo ? 'outline-danger' : 'outline-success'}
                        size="sm"
                        onClick={() => handleToggleStatus(user)}
                        title={user.activo ? 'Desactivar' : 'Activar'}
                      >
                        {user.activo ? <FiUserX /> : <FiUserCheck />}
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
          <Modal.Title>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserForm user={editingUser} onSave={handleSave} onCancel={() => setShowModal(false)} />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default UserList;
