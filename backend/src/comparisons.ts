import { Router } from 'express';
import type { Catalog } from './catalog/catalog-service.js';
import { SLUG_MAX_LENGTH, SLUG_PATTERN } from './catalog/slug.js';

export function comparisonsRouter(catalog: Pick<Catalog, 'findModel'>) {
  const router = Router();
  router.get('/', async (req, res) => {
    const slugs =
      typeof req.query.models === 'string' ? req.query.models.split(',') : [];
    if (
      slugs.length < 2 ||
      slugs.length > 10 ||
      new Set(slugs).size !== slugs.length ||
      slugs.some(
        (slug) => slug.length > SLUG_MAX_LENGTH || !SLUG_PATTERN.test(slug),
      )
    ) {
      res
        .status(400)
        .json({
          error: 'Select 2 to 10 distinct model slugs, separated by commas.',
        });
      return;
    }
    const models = await Promise.all(
      slugs.map((slug) => catalog.findModel(slug)),
    );
    const missing = models.indexOf(null);
    if (missing !== -1) {
      res.status(404).json({ error: 'Unknown model: ' + slugs[missing] });
      return;
    }
    res.json({
      models: models.flatMap((model) =>
        model
          ? [
              {
                slug: model.slug,
                name: model.name,
                lab: model.lab.name,
                releaseDate: model.releaseDate,
                benchmarks: model.benchmarks.map(({ benchmark, value }) => ({
                  benchmark,
                  value,
                })),
              },
            ]
          : [],
      ),
    });
  });
  return router;
}
