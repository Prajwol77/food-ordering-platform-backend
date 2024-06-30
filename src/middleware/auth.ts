import { auth } from "express-oauth2-jwt-bearer";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

declare global {
    namespace Express{
        interface Request{
            userId: string,
            auth0Id: string
        }
    }
}

// export const jwtCheck = auth({
//   audience: process.env.AUTH0_AUDIENCE,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
//   tokenSigningAlg: "RS256",
// });

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    const {authorization} = req.headers;

    if(!authorization ||!authorization.startsWith("Bearer ")){
        return res.sendStatus(401);
    }

    //Bearer lshdasdjladkahdkjahdjkanajdhakjdhjkahdj
    const tokenArray = authorization.split(" ");
    const token = tokenArray[1]
    
    try {
        const decoded = jwt.decode(token) as jwt.JwtPayload;
        const id = decoded.userId;

        const user = await User.findById(id);

        if(!user){
            return res.sendStatus(401)
        }

        req.userId = user._id.toString();
        next();

    }catch (error){
        return res.sendStatus(401);
    }
};
