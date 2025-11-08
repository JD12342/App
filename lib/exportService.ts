import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Garden, Harvest } from '../types/types';

interface ExportData {
  gardens: Garden[];
  harvests: Harvest[];
}

/**
 * Convert data to CSV format
 */
const generateCSV = (data: ExportData): string => {
  const { gardens, harvests } = data;
  
  // Create a mapping of garden IDs to names
  const gardenMap = new Map(gardens.map(g => [g.id, g.name]));
  
  // CSV Header
  const headers = ['Date', 'Garden', 'Plant Name', 'Quantity', 'Unit', 'Notes'];
  
  // CSV rows sorted by date
  const rows = harvests
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(h => [
      new Date(h.date).toLocaleDateString(),
      gardenMap.get(h.gardenId) || 'Unknown',
      h.plantName,
      h.quantity,
      h.unit,
      h.notes || '',
    ]);
  
  // Combine headers and rows
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  
  return csv;
};

/**
 * Generate summary statistics CSV
 */
const generateSummaryCSV = (data: ExportData): string => {
  const { gardens, harvests } = data;
  
  // Garden Summary
  let csv = 'GARDEN HARVEST REPORT\n';
  csv += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
  
  csv += 'SUMMARY STATISTICS\n';
  csv += '---\n';
  
  // Overall stats
  csv += `Total Harvests,${harvests.length}\n`;
  csv += `Total Gardens,${gardens.length}\n`;
  const uniquePlants = new Set(harvests.map(h => h.plantName)).size;
  csv += `Unique Plants,${uniquePlants}\n`;
  const totalYield = harvests.reduce((sum, h) => sum + h.quantity, 0);
  csv += `Total Yield,${totalYield}\n\n`;
  
  // Garden Details
  csv += 'GARDEN BREAKDOWN\n';
  csv += '---\n';
  csv += 'Garden Name,Total Harvests,Unique Plants\n';
  
  gardens.forEach(garden => {
    const gardenHarvests = harvests.filter(h => h.gardenId === garden.id);
    const uniquePlantsInGarden = new Set(gardenHarvests.map(h => h.plantName)).size;
    csv += `"${garden.name}",${gardenHarvests.length},${uniquePlantsInGarden}\n`;
  });
  
  csv += '\n';
  
  // Plant breakdown
  csv += 'TOP PLANTS BY YIELD\n';
  csv += '---\n';
  csv += 'Plant Name,Total Quantity,Unit\n';
  
  const plantMap = new Map<string, { quantity: number; unit: string }>();
  harvests.forEach(h => {
    const key = `${h.plantName}-${h.unit}`;
    if (plantMap.has(key)) {
      const current = plantMap.get(key)!;
      plantMap.set(key, {
        quantity: current.quantity + h.quantity,
        unit: h.unit,
      });
    } else {
      plantMap.set(key, { quantity: h.quantity, unit: h.unit });
    }
  });
  
  const sortedPlants = Array.from(plantMap.entries())
    .map(([key, value]) => ({
      plantName: key.split('-')[0],
      ...value,
    }))
    .sort((a, b) => b.quantity - a.quantity);
  
  sortedPlants.forEach(plant => {
    csv += `"${plant.plantName}",${plant.quantity},${plant.unit}\n`;
  });
  
  return csv;
};

/**
 * Export harvests data to CSV format
 */
export const exportToExcel = async (data: ExportData, filename?: string): Promise<void> => {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseFilename = filename || `Garden_Tracker_Report_${timestamp}`;
    
    // Generate main harvest data CSV
    const harvestCSV = generateCSV(data);
    
    // Create files in the document directory (which is accessible for file operations)
    const harvestFilename = `${baseFilename}_Harvests.csv`;
    
    // Try to save to the app's document directory which can be accessed
    const harvestFile = new File(Paths.document, harvestFilename);
    
    // Write file to file system
    await harvestFile.write(harvestCSV);
    
    console.log('File saved to:', harvestFile.uri);
    
    // Now share it to allow user to move to Downloads
    if (await Sharing.isAvailableAsync()) {
      // Share harvest data - this will allow user to save to Downloads/Files
      const result = await Sharing.shareAsync(harvestFile.uri, {
        mimeType: 'text/csv',
        UTI: 'public.comma-separated-values-text',
        dialogTitle: 'Save to Downloads',
      });
      
      console.log('Share result:', result);
    } else {
      throw new Error('Sharing is not available on this device');
    }
    
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

/**
 * Export data for a specific garden or all gardens
 */
export const exportGardenData = async (
  gardens: Garden[],
  harvests: Harvest[],
  gardenIds?: string[]
): Promise<void> => {
  try {
    // Filter gardens and harvests if specific gardens selected
    let selectedGardens = gardens;
    let selectedHarvests = harvests;
    
    if (gardenIds && gardenIds.length > 0) {
      selectedGardens = gardens.filter(g => gardenIds.includes(g.id));
      selectedHarvests = harvests.filter(h => gardenIds.includes(h.gardenId));
      
      // Create filename with garden names
      const gardenNames = selectedGardens.map(g => g.name.replace(/\s+/g, '_')).join('-');
      const filename = `Garden_Export_${gardenNames}`;
      
      await exportToExcel({ gardens: selectedGardens, harvests: selectedHarvests }, filename);
    } else {
      // Export all
      await exportToExcel({ gardens, harvests });
    }
  } catch (error) {
    console.error('Garden export error:', error);
    throw error;
  }
};

/**
 * Export specific garden data
 */
export const exportGardenToExcel = async (
  garden: Garden,
  harvests: Harvest[],
): Promise<void> => {
  const gardenHarvests = harvests.filter(h => h.gardenId === garden.id);
  const filename = `${garden.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}`;
  
  await exportToExcel({
    gardens: [garden],
    harvests: gardenHarvests,
  }, filename);
};

export default {
  exportToExcel,
  exportGardenToExcel,
};
