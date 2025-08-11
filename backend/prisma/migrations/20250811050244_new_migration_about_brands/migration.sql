-- DropForeignKey
ALTER TABLE "brand_features" DROP CONSTRAINT "brand_features_brandId_fkey";

-- DropForeignKey
ALTER TABLE "brand_features" DROP CONSTRAINT "brand_features_featureId_fkey";

-- DropForeignKey
ALTER TABLE "brand_plans" DROP CONSTRAINT "brand_plans_brandId_fkey";

-- DropForeignKey
ALTER TABLE "brand_plans" DROP CONSTRAINT "brand_plans_planId_fkey";

-- DropForeignKey
ALTER TABLE "custom_colors" DROP CONSTRAINT "custom_colors_brandId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_brandId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_brandPlanId_fkey";

-- AddForeignKey
ALTER TABLE "brand_plans" ADD CONSTRAINT "brand_plans_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_plans" ADD CONSTRAINT "brand_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_features" ADD CONSTRAINT "brand_features_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_features" ADD CONSTRAINT "brand_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_brandPlanId_fkey" FOREIGN KEY ("brandPlanId") REFERENCES "brand_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_colors" ADD CONSTRAINT "custom_colors_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
