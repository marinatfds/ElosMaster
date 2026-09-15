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
        <Box sx={{ p: 3 }}>
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

export default function Calendar() {
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
        <Tab label="Horário FGV" {...a11yProps(0)} />
        <Tab label="Horário PUC" {...a11yProps(1)} />
        <Tab label="Calendário Anual" {...a11yProps(2)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        Horario FGV
      </TabPanel>
      <TabPanel value={value} index={1}>
        Horario PUC
      </TabPanel>
      <TabPanel value={value} index={2}>
        <iframe src="https://docs.google.com/viewer?srcid=1L3RoXn9KLIVeqBi2KIq-oBrE8OxinZrZ&pid=explorer&efh=false&a=v&chrome=false&embedded=true" width="700px" height="510px"></iframe>
      </TabPanel>
    </Box>
  );
}
