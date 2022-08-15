import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 4 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export default function Test() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex' }}
    >
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider' }}
        className="side"
      >
        <Tab label="Simulado 1" {...a11yProps(0)} />
        <Tab label="Simulado 2" {...a11yProps(1)} />
        <Tab label="Simulado 3" {...a11yProps(2)} />
        <Tab label="Simulado 4" {...a11yProps(3)} />
        <Tab label="Simulado 5" {...a11yProps(4)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        Simulado 1
      </TabPanel>
      <TabPanel value={value} index={1}>
        Simulado 2
      </TabPanel>
      <TabPanel value={value} index={2}>
        Simulado 3
      </TabPanel>
      <TabPanel value={value} index={3}>
        Simulado 4
      </TabPanel>
      <TabPanel value={value} index={4}>
        Simulado 5
      </TabPanel>
    </Box>
  );
}
