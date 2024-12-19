import bcrypt from "bcrypt";



export const comparePassword = (password,hashed) => {
    return bcrypt.compare(password,hashed);
};
