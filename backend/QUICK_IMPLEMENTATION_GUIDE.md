# Quick Implementation Guide - बाँकी सुधारहरू

## 🚀 तुरुन्त लागू गर्नुपर्ने (१-२ दिनमा)

### १. Pagination सबै endpoints मा लागू गर्नुहोस्

**Example - Products Controller:**

```javascript
import { ApiResponse, PaginationHelper } from "../utils/apiResponse.js";
import logger from "../config/logger.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { page, limit, skip } = PaginationHelper.parsePaginationParams(req);
    
    // Build query
    const query = { isActive: true };
    if (req.query.category) query.category = req.query.category;
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Product.countDocuments(query),
    ]);

    return ApiResponse.successWithPagination(
      res,
      products,
      { page, limit, total },
      "Products fetched successfully"
    );
  } catch (error) {
    logger.error("Error fetching products:", error);
    return ApiResponse.error(res, error.message);
  }
};
```

**यो pattern सबै list endpoints मा लागू गर्नुहोस्:**
- `/api/products`
- `/api/orders`
- `/api/categories`
- `/api/users`
- `/api/reviews`

---

### २. Input Validation (Joi) लागू गर्नुहोस्

**Install:**
```bash
cd backend
npm install joi
```

**Create validation schemas:**

```javascript
// backend/src/validators/productValidator.js
import Joi from "joi";

export const createProductSchema = Joi.object({
  title: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10),
  price: Joi.number().required().min(0),
  category: Joi.string().required(),
  stock: Joi.number().required().min(0),
  images: Joi.array().items(Joi.string().uri()),
  isActive: Joi.boolean(),
});

export const updateProductSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().min(10),
  price: Joi.number().min(0),
  category: Joi.string(),
  stock: Joi.number().min(0),
  images: Joi.array().items(Joi.string().uri()),
  isActive: Joi.boolean(),
}).min(1); // At least one field required
```

**Use in routes:**

```javascript
import { validateInput } from "../middleware/security.js";
import { createProductSchema } from "../validators/productValidator.js";

router.post(
  "/products",
  auth,
  validateInput(createProductSchema),
  createProduct
);
```

---

### ३. API Documentation (Swagger) सेटअप गर्नुहोस्

**Install:**
```bash
npm install swagger-jsdoc swagger-ui-express
```

**Setup:**

```javascript
// backend/src/config/swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Furniture Store API",
      version: "1.0.0",
      description: "API documentation for Furniture Store",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"], // Path to API routes
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
```

**Add to app.js:**

```javascript
import { specs, swaggerUi } from "./config/swagger.js";

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
```

**Document endpoints:**

```javascript
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/products", getProducts);
```

---

### ४. Redis Caching सेटअप गर्नुहोस्

**Install:**
```bash
npm install redis
```

**Setup:**

```javascript
// backend/src/config/redis.js
import { createClient } from "redis";
import logger from "./logger.js";

let redisClient = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => {
      logger.error("Redis error:", err);
    });

    redisClient.on("connect", () => {
      logger.info("✅ Redis connected");
    });

    await redisClient.connect();
  } catch (error) {
    logger.error("Redis connection failed:", error);
    // Don't exit - app can work without Redis
  }
};

export const getRedisClient = () => redisClient;

// Cache middleware
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (!redisClient || !redisClient.isOpen) {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);
      if (cached) {
        logger.info(`Cache hit: ${key}`);
        return res.json(JSON.parse(cached));
      }
    } catch (error) {
      logger.error("Cache read error:", error);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json
    res.json = (data) => {
      // Cache the response
      if (redisClient && redisClient.isOpen) {
        redisClient
          .setEx(key, duration, JSON.stringify(data))
          .catch((err) => logger.error("Cache write error:", err));
      }
      return originalJson(data);
    };

    next();
  };
};
```

**Use caching:**

```javascript
import { cacheMiddleware } from "../config/redis.js";

// Cache for 5 minutes
router.get("/products", cacheMiddleware(300), getProducts);
router.get("/categories", cacheMiddleware(600), getCategories);
```

---

### ५. Error Monitoring (Sentry) सेटअप गर्नुहोस्

**Install:**
```bash
npm install @sentry/node @sentry/profiling-node
```

**Setup:**

```javascript
// backend/src/config/sentry.js
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

export const initSentry = (app) => {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
        new ProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });

    // Request handler must be first
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
  }
};

export const sentryErrorHandler = () => {
  if (process.env.NODE_ENV === "production" && process.env.SENTRY_DSN) {
    return Sentry.Handlers.errorHandler();
  }
  return (err, req, res, next) => next(err);
};
```

**Add to app.js:**

```javascript
import { initSentry, sentryErrorHandler } from "./config/sentry.js";

const app = express();

// Initialize Sentry (must be first)
initSentry(app);

// ... other middleware ...

// Sentry error handler (before your error handler)
app.use(sentryErrorHandler());
app.use(errorHandler);
```

---

## 📊 मध्यम प्राथमिकता (१ हप्तामा)

### ६. Testing सेटअप गर्नुहोस्

**Install:**
```bash
npm install --save-dev jest supertest @types/jest
```

**Configure:**

```javascript
// backend/jest.config.js
export default {
  testEnvironment: "node",
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/**/*.test.js",
  ],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  transform: {},
};
```

**Example test:**

```javascript
// backend/src/__tests__/auth.test.js
import request from "supertest";
import app from "../app.js";

describe("Auth API", () => {
  describe("POST /api/auth/signup", () => {
    it("should create a new user", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message");
    });

    it("should reject invalid email", async () => {
      const res = await request(app)
        .post("/api/auth/signup")
        .send({
          name: "Test User",
          email: "invalid-email",
          password: "password123",
        });

      expect(res.statusCode).toBe(400);
    });
  });
});
```

**Add scripts:**

```json
{
  "scripts": {
    "test": "NODE_ENV=test jest",
    "test:watch": "NODE_ENV=test jest --watch",
    "test:coverage": "NODE_ENV=test jest --coverage"
  }
}
```

---

### ७. Environment-specific Configuration

**Create config files:**

```javascript
// backend/src/config/index.js
import dotenv from "dotenv";

dotenv.config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  
  database: {
    uri: process.env.MONGO_URI,
    options: {
      maxPoolSize: process.env.DB_POOL_SIZE || 10,
      minPoolSize: 2,
    },
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    enabled: process.env.REDIS_ENABLED === "true",
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  email: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM,
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,
  },
  
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  },
};

export default config;
```

---

## 🎯 कसरी शुरू गर्ने?

### Day 1:
1. ✅ Security improvements - COMPLETED
2. ✅ Logging system - COMPLETED
3. ⚠️ Pagination लागू गर्नुहोस् (2-3 hours)

### Day 2:
4. Input validation लागू गर्नुहोस् (3-4 hours)
5. API documentation सुरू गर्नुहोस् (2-3 hours)

### Day 3:
6. Redis caching सेटअप गर्नुहोस् (2-3 hours)
7. Sentry error monitoring (1-2 hours)

### Day 4-5:
8. Testing सेटअप र basic tests (4-6 hours)
9. Production deployment तयारी (3-4 hours)

### Week 2:
10. Load testing
11. Security audit
12. Performance optimization
13. Documentation पूर्ण गर्ने

---

## 📚 Resources

### Documentation:
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [MongoDB Performance](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Tools:
- [Postman](https://www.postman.com/) - API testing
- [k6](https://k6.io/) - Load testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance
- [OWASP ZAP](https://www.zaproxy.org/) - Security testing

---

## ✅ Verification Checklist

After implementing each feature:

- [ ] Code works locally
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to staging
- [ ] Tested in staging
- [ ] Deployed to production
- [ ] Monitoring alerts configured
