import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Import User type but rename it to avoid conflicts
import type { User as SchemaUser } from "@shared/schema";

// Extend Express namespace for type safety without circular reference
declare global {
  namespace Express {
    interface User extends SchemaUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // For now, we're just comparing the passwords directly since they're stored in plaintext
  // In production, use the below commented code to compare hashed passwords
  return supplied === stored;
  
  /*
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
  */
}

export function setupAuth(app: Express) {
  const PostgresSessionStore = connectPg(session);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "some_secret_for_development",
    resave: false,
    saveUninitialized: false,
    store: new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    }),
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`Login attempt for user: ${username}, password: ${password}`);
        const user = await storage.getUserByUsername(username);
        console.log('User found:', user ? 'yes' : 'no');
        
        if (!user) {
          console.log('User not found');
          return done(null, false);
        }
        
        const passwordMatches = await comparePasswords(password, user.password);
        console.log('Password match:', passwordMatches ? 'yes' : 'no');
        console.log('Stored password:', user.password);
        
        if (!passwordMatches) {
          return done(null, false);
        }
        
        console.log('Authentication successful');
        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, fullName, tenantId } = req.body;
      
      if (!username || !password || !fullName || !tenantId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        password, // In production, use: await hashPassword(password)
        fullName,
        tenantId: parseInt(tenantId),
        role: "admin", // Default role for now
        isActive: true
      });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          tenantId: user.tenantId
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('Login request received:', req.body);
    
    passport.authenticate('local', (err, user, info) => {
      console.log('Auth callback:', { err, user: user ? 'exists' : 'null', info });
      
      if (err) {
        console.error('Auth error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Authentication failed');
        return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Login error:', loginErr);
          return next(loginErr);
        }
        
        console.log('Login success, session created for user:', user.username);
        return res.status(200).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          tenantId: user.tenantId
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.user as SchemaUser;
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId
    });
  });
}