import { Router } from "express";
import { healthRouter } from "./health.js";
import { usersRouter } from "./users.js";
import { authRouter } from "./auth.js";
import { agentsRouter } from "./agents.js";

import { applicationsRouter } from "./applications.js";
import { epinsRouter } from "./epins.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/agents", agentsRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/epins", epinsRouter);


