import jwt, { JwtPayload } from "jsonwebtoken";

const parseToken = async (authorization: string | undefined) => {
  try {
    if (process.env.JWT_SECRET_KEY) {
      if(!authorization){
        return false;
      }
      if (!authorization.startsWith("Bearer ")) {
        return false;
      }
      const token = authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
      return decodedToken as JwtPayload;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default parseToken;
