// Componentes de wrapper para resolver problemas de compatibilidade
import { 
  Tabs as ChakraTabs, 
  TabList as ChakraTabList,
  TabPanels as ChakraTabPanels,
  Tab as ChakraTab,
  TabPanel as ChakraTabPanel,
} from '@chakra-ui/react';

// Re-exportar componentes com nomes consistentes
export const Tabs = ChakraTabs;
export const TabList = ChakraTabList;
export const TabPanels = ChakraTabPanels;
export const Tab = ChakraTab;
export const TabPanel = ChakraTabPanel;

// Re-exportar para manter compatibilidade com código existente
export {
  ChakraTabs,
  ChakraTabList,
  ChakraTabPanels,
  ChakraTab,
  ChakraTabPanel,
};
