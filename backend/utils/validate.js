const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Validates a request body against an allow-list of rules.
 * Only fields declared in `rules` are returned, which prevents mass-assignment
 * of protected fields such as `user`, `_id`, `createdAt` or `role`.
 *
 * @returns {{ errors: string[], values: Record<string, unknown> }}
 */
const validate = (data, rules) => {
  const errors = [];
  const values = {};
  const source = isPlainObject(data) ? data : {};

  for (const [field, rule] of Object.entries(rules)) {
    const label = rule.label || field;
    const raw = source[field];
    if (rule.nullable && (raw === null || raw === '')) {
      values[field] = null;
      continue;
    }

    const empty =
      raw === undefined ||
      raw === null ||
      (typeof raw === 'string' && raw.trim() === '');

    if (empty) {
      if (rule.required) {
        errors.push(`${label} is required`);
      } else if (Object.prototype.hasOwnProperty.call(rule, 'default')) {
        values[field] = rule.default;
      }
      continue;
    }

    if (rule.type === 'date') {
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) {
        errors.push(`${label} must be a valid date`);
      } else {
        values[field] = date;
      }
      continue;
    }

    if (typeof raw !== 'string') {
      errors.push(`${label} must be text`);
      continue;
    }

    const value = rule.trim === false ? raw : raw.trim();

    if (rule.min && value.length < rule.min) {
      errors.push(`${label} must be at least ${rule.min} characters`);
      continue;
    }

    if (rule.max && value.length > rule.max) {
      errors.push(`${label} cannot exceed ${rule.max} characters`);
      continue;
    }

    if (rule.email && !EMAIL_PATTERN.test(value)) {
      errors.push(`${label} must be a valid email address`);
      continue;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.patternMessage || `${label} is invalid`);
      continue;
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${label} must be one of: ${rule.enum.join(', ')}`);
      continue;
    }

    values[field] = value;
  }

  return { errors, values };
};

module.exports = { validate, EMAIL_PATTERN };
