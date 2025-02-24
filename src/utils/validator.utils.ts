interface User {
  id: number; // Assuming id is a number
  username: string; // Assuming username is a string
  // Include other fields if necessary, but they will be ignored
}

export function sanitizeResponseUser(
  user: User
): Pick<User, 'id' | 'username'> {
  return {
    id: user.id,
    username: user.username
  };
}
