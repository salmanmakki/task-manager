/**
 * End-to-end API smoke suite.
 *
 * Starts no server: run `npm run dev` in one terminal, then `npm test` here.
 * The suite intentionally exhausts the login rate limit at the end, so restart
 * the API (or wait 15 minutes) before using the UI.
 */
const root = process.cwd();

require(root + '/node_modules/dotenv').config({ quiet: true });

const mongoose = require(root + '/node_modules/mongoose');
const User = require(root + '/models/User');
const Task = require(root + '/models/Task');
const connectDB = require(root + '/config/db');

const BASE = process.env.API_URL || 'http://127.0.0.1:5000/api';
const RUN = Date.now();
const EMAIL_A = `smoke.alice.${RUN}@taskflow.local`;
const EMAIL_B = `smoke.bob.${RUN}@taskflow.local`;
const EMAIL_B_NEW = `smoke.bob.new.${RUN}@taskflow.local`;
const PASSWORD = 'StrongPass1';
const NEW_PASSWORD = 'NewStrongPass2';

let failures = 0;
const jar = new Map();

const check = (condition, label) => {
  console.log(`${condition ? 'PASS' : 'FAIL'} - ${label}`);
  if (!condition) failures += 1;
};

const expectStatus = (result, expected, label) => {
  const ok = result.status === expected;
  const detail = ok ? '' : ` :: ${JSON.stringify(result.body).slice(0, 240)}`;
  check(ok, `${label} (${result.status} ${ok ? 'OK' : `!= ${expected}`})${detail}`);
};

const storeCookies = (response) => {
  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : [response.headers.get('set-cookie')].filter(Boolean);

  for (const raw of setCookies) {
    const [pair, ...attributes] = raw.split(';');
    const separator = pair.indexOf('=');
    if (separator === -1) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    const expired = attributes.some(
      (attribute) => /max-age=0/i.test(attribute) || /expires=thu, 01 jan 1970/i.test(attribute)
    );
    if (!value || expired) {
      jar.delete(name);
    } else {
      jar.set(name, value);
    }
  }

  return setCookies;
};

const cookieHeader = () =>
  [...jar.entries()].map(([name, value]) => `${name}=${value}`).join('; ');

const call = async (method, path, body, extraHeaders = {}) => {
  const headers = { ...extraHeaders };
  const cookies = cookieHeader();
  if (cookies) headers.cookie = cookies;
  if (body !== undefined) headers['content-type'] = 'application/json';

  const response = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const setCookies = storeCookies(response);
  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  return { status: response.status, body: parsed, setCookies };
};

const waitForServer = async () => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await fetch(BASE + '/health');
      if (response.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error('API did not become ready in time');
};

const isoDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const cleanup = async () => {
  try {
    await connectDB();
    const users = await User.find({ email: /^smoke\./ }).select('_id');
    const ids = users.map((user) => user._id);
    if (ids.length) {
      await Task.deleteMany({ user: { $in: ids } });
    }
    await User.deleteMany({ email: /^smoke\./ });
    console.log('Cleanup complete');
  } catch (error) {
    console.error(`Cleanup failed: ${error.message}`);
  }
};

(async () => {
  try {
    await waitForServer();

    let result = await call('GET', '/health');
    expectStatus(result, 200, 'health endpoint');
    check(result.body?.data?.database === 'connected', 'database reports connected');

    result = await call('GET', '/tasks');
    expectStatus(result, 401, 'tasks require authentication');

    result = await call('POST', '/auth/logout', undefined, { origin: 'https://evil.example' });
    expectStatus(result, 403, 'foreign origin blocked by CSRF guard');

    result = await call('POST', '/auth/register', {
      name: 'Alice Tester',
      email: EMAIL_A,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    expectStatus(result, 201, 'register user A');
    check(result.body?.data?.user?.email === EMAIL_A, 'email returned normalized');
    check(!('password' in (result.body?.data?.user || {})), 'register response has no password');
    const cookieText = result.setCookies.join(' ');
    check(/HttpOnly/i.test(cookieText), 'session cookie is HttpOnly');
    check(/SameSite=Lax/i.test(cookieText), 'dev session cookie is SameSite=Lax');
    check(/Path=\//i.test(cookieText), 'session cookie path is /');
    check(jar.size > 0, 'session cookie stored by client');

    result = await call('GET', '/auth/me');
    expectStatus(result, 200, 'GET /auth/me with cookie');
    check(result.body?.data?.user?.email === EMAIL_A, 'me returns current user');

    result = await call('POST', '/auth/register', {
      name: 'Duplicate Alice',
      email: EMAIL_A.toUpperCase(),
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    expectStatus(result, 409, 'duplicate email rejected');

    result = await call('POST', '/auth/register', {
      name: 'Weak Password',
      email: `smoke.weak.${RUN}@taskflow.local`,
      password: 'short',
      confirmPassword: 'short',
    });
    expectStatus(result, 400, 'weak password rejected');

    result = await call('POST', '/auth/register', {
      email: `smoke.noname.${RUN}@taskflow.local`,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    expectStatus(result, 400, 'missing name rejected');

    result = await call('POST', '/auth/register', {
      name: 'Mismatch User',
      email: `smoke.mismatch.${RUN}@taskflow.local`,
      password: PASSWORD,
      confirmPassword: 'DifferentPass1',
    });
    expectStatus(result, 400, 'password confirmation mismatch rejected');

    result = await call('POST', '/auth/login', { email: EMAIL_A, password: 'WrongPass1' });
    expectStatus(result, 401, 'wrong password rejected');

    result = await call('POST', '/auth/login', { email: EMAIL_A, password: PASSWORD });
    expectStatus(result, 200, 'login user A');
    check(!('password' in (result.body?.data?.user || {})), 'login response has no password');

    const spoofedUser = new mongoose.Types.ObjectId().toString();

    result = await call('POST', '/tasks', {
      title: 'Prepare sprint plan',
      description: 'Outline deliverables for the phase',
      priority: 'High',
      status: 'Pending',
      dueDate: isoDaysFromNow(3),
      user: spoofedUser,
    });
    expectStatus(result, 201, 'create task A1');
    const taskA1 = result.body?.data?.task;
    check(taskA1?.user !== spoofedUser, 'mass-assignment of user blocked');

    result = await call('POST', '/tasks', {
      title: 'Fix dashboard bug',
      description: 'Search keyword: regression',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: isoDaysFromNow(-1),
    });
    expectStatus(result, 201, 'create task A2');
    const taskA2 = result.body?.data?.task;

    result = await call('POST', '/tasks', {
      title: 'Write launch notes',
      description: '',
      priority: 'Low',
      status: 'Completed',
      dueDate: null,
    });
    expectStatus(result, 201, 'create task A3');

    result = await call('POST', '/tasks', { title: 'A' });
    expectStatus(result, 400, 'short title rejected');

    result = await call('POST', '/tasks', { title: 'Bad priority', priority: 'Urgent' });
    expectStatus(result, 400, 'invalid priority rejected');

    result = await call('POST', '/tasks', {
      title: 'Bad date',
      dueDate: 'not-a-date',
    });
    expectStatus(result, 400, 'invalid due date rejected');

    result = await call('GET', '/tasks');
    expectStatus(result, 200, 'list tasks');
    check(result.body?.data?.total === 3, 'list returns 3 tasks');

    result = await call('GET', '/tasks?search=regression');
    check(result.body?.data?.total === 1, 'description search matches one task');
    check(result.body?.data?.tasks?.[0]?.title === 'Fix dashboard bug', 'search returns expected task');

    result = await call('GET', '/tasks?search=SPRINT');
    check(result.body?.data?.total === 1, 'search is case-insensitive on title');

    result = await call('GET', '/tasks?status=Completed');
    check(result.body?.data?.total === 1, 'status filter works');

    result = await call('GET', '/tasks?priority=High');
    check(result.body?.data?.total === 1, 'priority filter works');

    result = await call('GET', '/tasks?status=Pending&priority=High');
    check(result.body?.data?.total === 1, 'combined filters work');

    result = await call('GET', '/tasks?status=Nope');
    expectStatus(result, 400, 'invalid status filter rejected');

    result = await call('GET', '/tasks?sort=nope');
    expectStatus(result, 400, 'invalid sort rejected');

    result = await call('GET', '/tasks?sort=dueDate_asc');
    check(
      result.body?.data?.tasks?.[2]?.title === 'Write launch notes',
      'dueDate_asc pushes null due dates last'
    );

    result = await call('GET', '/tasks?sort=dueDate_desc');
    check(
      result.body?.data?.tasks?.[0]?.title === 'Prepare sprint plan',
      'dueDate_desc sorts latest first'
    );

    result = await call('GET', `/tasks/${taskA1._id}`);
    expectStatus(result, 200, 'get task by id');

    result = await call('GET', `/tasks/${new mongoose.Types.ObjectId()}`);
    expectStatus(result, 404, 'missing task returns 404');

    result = await call('PUT', `/tasks/${taskA1._id}`, {
      title: 'Prepare sprint plan v2',
      description: 'Refined deliverables',
      priority: 'High',
      status: 'In Progress',
      dueDate: '',
    });
    expectStatus(result, 200, 'update task');
    check(result.body?.data?.task?.title === 'Prepare sprint plan v2', 'update persisted title');
    check(result.body?.data?.task?.dueDate === null, 'empty due date clears the field');

    result = await call('PATCH', `/tasks/${taskA2._id}/status`, { status: 'Completed' });
    expectStatus(result, 200, 'patch task status');
    check(result.body?.data?.task?.status === 'Completed', 'status patch persisted');

    result = await call('PATCH', `/tasks/${taskA2._id}/status`, { status: 'Done' });
    expectStatus(result, 400, 'invalid status patch rejected');

    result = await call('GET', '/tasks/stats');
    expectStatus(result, 200, 'dashboard stats');
    const stats = result.body?.data;
    check(stats?.total === 3, 'stats total');
    check(stats?.pending === 0, 'stats pending');
    check(stats?.inProgress === 1, 'stats in progress');
    check(stats?.completed === 2, 'stats completed');
    check(stats?.completionRate === 67, 'stats completion rate');
    check(stats?.priority?.High === 1 && stats?.priority?.Medium === 1 && stats?.priority?.Low === 1, 'stats priority distribution');
    check(stats?.overdue === 0, 'stats overdue excludes completed');
    check(Array.isArray(stats?.recentTasks) && stats.recentTasks.length === 3, 'stats recent tasks');

    result = await call('POST', '/auth/logout');
    expectStatus(result, 200, 'logout A');
    check(jar.size === 0, 'cookie cleared on logout');

    result = await call('GET', '/auth/me');
    expectStatus(result, 401, 'me after logout is unauthorized');

    result = await call('POST', '/auth/register', {
      name: 'Bob Tester',
      email: EMAIL_B,
      password: PASSWORD,
      confirmPassword: PASSWORD,
    });
    expectStatus(result, 201, 'register user B');

    result = await call('GET', '/tasks');
    check(result.body?.data?.total === 0, 'user B sees no tasks from user A');

    result = await call('GET', `/tasks/${taskA1._id}`);
    expectStatus(result, 404, 'user B cannot read user A task');

    result = await call('PUT', `/tasks/${taskA1._id}`, { title: 'Hijacked task' });
    expectStatus(result, 404, 'user B cannot update user A task');

    result = await call('PATCH', `/tasks/${taskA1._id}/status`, { status: 'Completed' });
    expectStatus(result, 404, 'user B cannot change user A task status');

    result = await call('DELETE', `/tasks/${taskA1._id}`);
    expectStatus(result, 404, 'user B cannot delete user A task');

    result = await call('PUT', '/users/profile', { name: 'Bob Hijack', email: EMAIL_A });
    expectStatus(result, 409, 'profile cannot take another user email');

    result = await call('PUT', '/users/profile', { name: 'Bob Updated', email: EMAIL_B_NEW });
    expectStatus(result, 200, 'update profile');
    check(result.body?.data?.user?.email === EMAIL_B_NEW, 'profile email updated');

    result = await call('PUT', '/users/change-password', {
      currentPassword: 'WrongCurrent1',
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    expectStatus(result, 401, 'wrong current password rejected');

    result = await call('PUT', '/users/change-password', {
      currentPassword: PASSWORD,
      newPassword: NEW_PASSWORD,
      confirmPassword: NEW_PASSWORD,
    });
    expectStatus(result, 200, 'change password');

    await call('POST', '/auth/logout');
    result = await call('POST', '/auth/login', { email: EMAIL_B_NEW, password: PASSWORD });
    expectStatus(result, 401, 'old password no longer works');

    result = await call('POST', '/auth/login', { email: EMAIL_B_NEW, password: NEW_PASSWORD });
    expectStatus(result, 200, 'new password works');

    result = await call('POST', '/auth/logout', undefined, { origin: 'http://localhost:5173' });
    expectStatus(result, 200, 'allowed origin passes CSRF guard');

    let sawRateLimit = false;
    for (let attempt = 0; attempt < 36; attempt += 1) {
      const response = await call('POST', '/auth/login', {
        email: EMAIL_B_NEW,
        password: 'WrongPass1',
      });
      if (response.status === 429) {
        sawRateLimit = true;
        break;
      }
    }
    check(sawRateLimit, 'auth rate limiting returns 429');
  } catch (error) {
    failures += 1;
    console.error(`TEST ERROR: ${error.message}`);
  } finally {
    await cleanup();
    await mongoose.disconnect().catch(() => {});
    console.log(failures === 0 ? 'RESULT: ALL API TESTS PASSED' : `RESULT: ${failures} FAILURE(S)`);
    process.exit(failures === 0 ? 0 : 1);
  }
})();
