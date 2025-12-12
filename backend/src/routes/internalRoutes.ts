/**
 * @summary
 * Internal API routes configuration.
 * Handles authenticated endpoints for business operations.
 *
 * @module routes/internalRoutes
 */

import { Router } from 'express';
import * as initExampleController from '@/api/internal/init-example/controller';
import * as imageUploadController from '@/api/internal/image-upload/controller';
import { uploadMiddleware } from '@/middleware/upload';

const router = Router();

/**
 * @rule {be-route-configuration}
 * Init-Example routes - /api/internal/init-example
 */
router.get('/init-example', initExampleController.listHandler);
router.post('/init-example', initExampleController.createHandler);
router.get('/init-example/:id', initExampleController.getHandler);
router.put('/init-example/:id', initExampleController.updateHandler);
router.delete('/init-example/:id', initExampleController.deleteHandler);

/**
 * @rule {be-route-configuration}
 * Image Upload routes - /api/internal/image-upload
 */
router.post('/image-upload', uploadMiddleware, imageUploadController.uploadHandler);
router.get('/image-upload/session/:sessionId', imageUploadController.getSessionHandler);
router.post('/image-upload/session/:sessionId/reset', imageUploadController.resetSessionHandler);

export default router;
