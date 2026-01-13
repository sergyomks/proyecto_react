import * as Yup from 'yup';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Roles disponibles en el sistema
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
  CAJERO: 'cajero'
};

// Permisos por rol
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'users:read', 'users:create', 'users:update', 'users:delete',
    'products:read', 'products:create', 'products:update', 'products:delete',
    'categories:read', 'categories:create', 'categories:update', 'categories:delete',
    'inventory:read', 'inventory:create', 'inventory:update',
    'sales:read', 'sales:create', 'sales:cancel',
    'reports:read', 'reports:export',
    'dashboard:read',
    'settings:read', 'settings:update'
  ],
  [USER_ROLES.VENDEDOR]: [
    'products:read',
    'categories:read',
    'inventory:read',
    'sales:read', 'sales:create',
    'dashboard:read'
  ],
  [USER_ROLES.CAJERO]: [
    'products:read',
    'categories:read',
    'sales:read', 'sales:create',
    'dashboard:read'
  ]
};

// Schema de validación para crear usuario
export const UserCreateSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es requerida'),
  role: Yup.string()
    .oneOf(Object.values(USER_ROLES), 'Rol inválido')
    .required('El rol es requerido')
});


// Schema de validación para actualizar usuario
export const UserUpdateSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: Yup.string()
    .email('Email inválido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: Yup.string()
    .oneOf(Object.values(USER_ROLES), 'Rol inválido'),
  isActive: Yup.boolean()
});

// Schema de validación para login
export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .required('La contraseña es requerida')
});

/**
 * Crea un nuevo usuario con contraseña hasheada
 * @param {Object} userData - Datos del usuario
 * @returns {Object} Usuario creado
 */
export const createUser = async (userData) => {
  const validated = await UserCreateSchema.validate(userData);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(validated.password, salt);
  
  return {
    id: uuidv4(),
    name: validated.name,
    email: validated.email.toLowerCase(),
    passwordHash,
    role: validated.role,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Verifica si la contraseña coincide con el hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {boolean}
 */
export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {Object} user - Usuario
 * @param {string} permission - Permiso a verificar
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
};

/**
 * Serializa un usuario para almacenamiento (sin contraseña en texto plano)
 * @param {Object} user - Usuario
 * @returns {string} JSON string
 */
export const serializeUser = (user) => {
  const { password, ...safeUser } = user;
  return JSON.stringify(safeUser);
};

/**
 * Deserializa un usuario desde almacenamiento
 * @param {string} json - JSON string
 * @returns {Object} Usuario
 */
export const deserializeUser = (json) => {
  return JSON.parse(json);
};

/**
 * Retorna usuario sin datos sensibles para respuestas
 * @param {Object} user - Usuario
 * @returns {Object} Usuario seguro
 */
export const toSafeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};
