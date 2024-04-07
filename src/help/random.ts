const usernames = ["Zetax", "Eccentric", "Blurr", "Scar", "Magma", "Kaede"];

export const randomUsername = () => {
  return usernames[Math.floor(Math.random() * usernames.length)];
};
