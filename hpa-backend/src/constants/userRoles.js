const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin"
});

const USER_ROLE_VALUES = Object.values(USER_ROLES);

function isSuperAdminRole(role) {
  return role === USER_ROLES.SUPER_ADMIN;
}

/** Admin dashboard and other admin-only routes (super_admin included for now). */
function isAdminRole(role) {
  return role === USER_ROLES.ADMIN || isSuperAdminRole(role);
}

function resolveBootstrapRole(email, { superAdminEmails, adminEmails }) {
  if (superAdminEmails.has(email)) {
    return USER_ROLES.SUPER_ADMIN;
  }
  if (adminEmails.has(email)) {
    return USER_ROLES.ADMIN;
  }
  return USER_ROLES.USER;
}

module.exports = {
  USER_ROLES,
  USER_ROLE_VALUES,
  isSuperAdminRole,
  isAdminRole,
  resolveBootstrapRole
};
