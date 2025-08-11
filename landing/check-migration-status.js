#!/usr/bin/env node

// Script para verificar el estado de migración de datos hardcoded a API

const fs = require('fs');
const path = require('path');

const WORKSPACE_PATH = process.cwd();
const COMPONENTS_PATH = path.join(WORKSPACE_PATH, 'components');
const APP_PATH = path.join(WORKSPACE_PATH, 'app');

// Patrones que indican uso de datos hardcoded
const HARDCODED_PATTERNS = [
  'APP_FEATURES',
  'BUSINESS_TYPES',
  'from "@/lib/business-types"',
  'from \'@/lib/business-types\'',
  'getRecommendedFeatures(',
  'getBusinessType(',
  'getAppFeature('
];

// Patrones que indican migración a API
const API_PATTERNS = [
  'useLandingData',
  'from "@/hooks/use-landing-data"',
  'from \'@/hooks/use-landing-data\'',
  'getFeaturesByCategory',
  'getBusinessTypeByKey'
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const hasHardcoded = HARDCODED_PATTERNS.some(pattern => 
      content.includes(pattern)
    );
    
    const hasAPIUsage = API_PATTERNS.some(pattern => 
      content.includes(pattern)
    );
    
    return {
      file: path.relative(WORKSPACE_PATH, filePath),
      hasHardcoded,
      hasAPIUsage,
      status: hasAPIUsage ? (hasHardcoded ? 'MIXED' : 'MIGRATED') : (hasHardcoded ? 'NEEDS_MIGRATION' : 'NO_DATA')
    };
  } catch (error) {
    return null;
  }
}

function scanDirectory(dirPath) {
  const results = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        results.push(...scanDirectory(itemPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const result = scanFile(itemPath);
        if (result) {
          results.push(result);
        }
      }
    }
  } catch (error) {
    console.log(`Error scanning directory ${dirPath}: ${error.message}`);
  }
  
  return results;
}

function main() {
  console.log('🔍 Escaneando archivos para verificar migración API...\n');
  
  const results = [
    ...scanDirectory(COMPONENTS_PATH),
    ...scanDirectory(APP_PATH)
  ];
  
  // Filtrar solo archivos que tienen datos relacionados
  const relevantFiles = results.filter(r => 
    r.status !== 'NO_DATA'
  );
  
  const migrated = relevantFiles.filter(r => r.status === 'MIGRATED');
  const needsMigration = relevantFiles.filter(r => r.status === 'NEEDS_MIGRATION');
  const mixed = relevantFiles.filter(r => r.status === 'MIXED');
  
  console.log(`📊 RESUMEN DE MIGRACIÓN:`);
  console.log(`✅ Archivos migrados: ${migrated.length}`);
  console.log(`❌ Archivos que necesitan migración: ${needsMigration.length}`);
  console.log(`⚠️  Archivos con uso mixto: ${mixed.length}`);
  console.log(`📄 Total archivos relevantes: ${relevantFiles.length}\n`);
  
  if (migrated.length > 0) {
    console.log('✅ ARCHIVOS MIGRADOS:');
    migrated.forEach(file => {
      console.log(`   ${file.file}`);
    });
    console.log('');
  }
  
  if (mixed.length > 0) {
    console.log('⚠️ ARCHIVOS CON USO MIXTO (requieren limpieza):');
    mixed.forEach(file => {
      console.log(`   ${file.file}`);
    });
    console.log('');
  }
  
  if (needsMigration.length > 0) {
    console.log('❌ ARCHIVOS QUE NECESITAN MIGRACIÓN:');
    needsMigration.forEach(file => {
      console.log(`   ${file.file}`);
    });
    console.log('');
  }
  
  if (needsMigration.length === 0 && mixed.length === 0) {
    console.log('🎉 ¡MIGRACIÓN COMPLETA! Todos los archivos están usando la API.');
  } else {
    console.log(`📋 PRÓXIMOS PASOS:`);
    if (mixed.length > 0) {
      console.log(`   1. Limpiar archivos con uso mixto (${mixed.length})`);
    }
    if (needsMigration.length > 0) {
      console.log(`   2. Migrar archivos pendientes (${needsMigration.length})`);
    }
    console.log(`   3. Ver MIGRATION_API_GUIDE.md para instrucciones detalladas`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scanFile, scanDirectory, main };
