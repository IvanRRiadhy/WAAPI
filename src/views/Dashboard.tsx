import React, { useState, useMemo } from 'react';
import { Box, Card, CardContent, Typography, Grid, useTheme } from '@mui/material';
import { IconSend, IconUsers, IconCircleCheck } from '@tabler/icons-react';
import Chart from 'react-apexcharts';

export const Dashboard: React.FC = () => {
  const theme = useTheme();
  const [tabIndex] = useState(2);

  const dailyCategories = ['May 28', 'May 29', 'May 30', 'May 31', 'Jun 1', 'Jun 2', 'Jun 3'];

  // Dummy series data for last 7 days
  const dailySeries = [
    // {
    //   name: 'Pending',
    //   data: [120, 150, 80, 90, 110, 70, 95]
    // },
    {
      name: 'Sent',
      data: [850, 920, 780, 810, 950, 600, 750]
    },
    {
      name: 'Failed',
      data: [30, 45, 20, 25, 35, 15, 20]
    }
  ];

  const chartColors = [
    theme.palette.success.main,
    theme.palette.error.main,
    theme.palette.warning.main,
  ];

  const commonOptions: any = useMemo(() => ({
    chart: {
      fontFamily: theme.typography.fontFamily,
      toolbar: { show: false },
      background: 'transparent',
    },
    colors: chartColors,
    theme: {
      mode: theme.palette.mode,
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => `${val} messages`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: [theme.palette.text.primary],
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: Array(7).fill(theme.palette.text.secondary),
          fontSize: '11px',
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: [theme.palette.text.secondary],
          fontSize: '11px',
        }
      }
    }
  }), [theme, chartColors]);

  const chartConfig = useMemo(() => {
    switch (tabIndex) {
      case 1: // Stacked Column
        return {
          type: 'bar' as const,
          options: {
            ...commonOptions,
            chart: {
              ...commonOptions.chart,
              stacked: true,
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '50%',
                borderRadius: 4,
              }
            },
            xaxis: {
              ...commonOptions.xaxis,
              categories: dailyCategories,
            }
          }
        };
      case 2: // Line Chart
        return {
          type: 'line' as const,
          options: {
            ...commonOptions,
            chart: {
              ...commonOptions.chart,
              stacked: false,
            },
            stroke: {
              curve: 'smooth' as const,
              width: 3,
            },
            xaxis: {
              ...commonOptions.xaxis,
              categories: dailyCategories,
            }
          }
        };
      case 3: // Horizontal Bar
        return {
          type: 'bar' as const,
          options: {
            ...commonOptions,
            chart: {
              ...commonOptions.chart,
              stacked: false,
            },
            plotOptions: {
              bar: {
                horizontal: true,
                barHeight: '60%',
                borderRadius: 4,
              }
            },
            grid: {
              ...commonOptions.grid,
              xaxis: { lines: { show: true } },
              yaxis: { lines: { show: false } },
            },
            xaxis: {
              ...commonOptions.xaxis,
              categories: dailyCategories,
            }
          }
        };
      case 0: // Grouped Bar
      default:
        return {
          type: 'bar' as const,
          options: {
            ...commonOptions,
            chart: {
              ...commonOptions.chart,
              stacked: false,
            },
            plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '50%',
                borderRadius: 4,
              }
            },
            xaxis: {
              ...commonOptions.xaxis,
              categories: dailyCategories,
            }
          }
        };
    }
  }, [tabIndex, commonOptions, dailyCategories]);

  // Donut chart config for current distribution (sum or today's last elements)
  const donutOptions = useMemo(() => ({
    chart: {
      fontFamily: theme.typography.fontFamily,
      background: 'transparent',
    },
    colors: chartColors,
    labels: ['Pending', 'Sent', 'Failed'],
    stroke: {
      show: true,
      colors: [theme.palette.background.paper],
      width: 2,
    },
    legend: {
      position: 'bottom' as const,
      labels: {
        colors: theme.palette.text.primary,
      },
    },
    theme: {
      mode: theme.palette.mode,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: theme.palette.text.secondary,
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 800,
              color: theme.palette.text.primary,
              offsetY: 5,
              formatter: (val: string) => val,
            },
            total: {
              show: true,
              label: 'Total Today',
              color: theme.palette.text.secondary,
              fontSize: '12px',
              fontWeight: 600,
              formatter: () => '865',
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      theme: theme.palette.mode,
    }
  }), [theme, chartColors]);

  const donutSeries = [750, 20, 95];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Summary Cards */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 3 } }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(129, 140, 248, 0.12)',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconSend size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Messages Sent
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  12,450
                </Typography>
                <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  +12.4% <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>vs last week</Typography>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 3 } }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(8, 145, 178, 0.08)' : 'rgba(6, 182, 212, 0.12)',
                  color: 'secondary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconUsers size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Agents
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  15
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mt: 0.5 }}>
                  All agents operational
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5, '&:last-child': { pb: 3 } }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(46, 125, 50, 0.08)' : 'rgba(74, 222, 128, 0.12)',
                  color: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <IconCircleCheck size={24} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Delivery Rate
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                  94.2%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mt: 0.5 }}>
                  11,730 delivered successfully
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Analytics Grid */}
      <Grid container spacing={3}>
        {/* Daily Analytics Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 3.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Message Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Daily traffic breakdown for the last 7 days
                  </Typography>
                </Box>

                {/* Tabs to toggle chart types */}
                {/* <Tabs 
                  value={tabIndex} 
                  onChange={(_, val) => setTabIndex(val)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ 
                    minHeight: 36,
                    '& .MuiTab-root': {
                      minHeight: 36,
                      py: 1,
                      px: 2,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      borderRadius: 1.5,
                      textTransform: 'none',
                    }
                  }}
                >
                  <Tab label="Grouped Bar" />
                  <Tab label="Stacked Column" />
                  <Tab label="Line Chart" />
                  <Tab label="Horizontal Bar" />
                </Tabs> */}
              </Box>

              {/* Chart Render */}
              <Box sx={{ flexGrow: 1, width: '100%', minHeight: 320 }}>
                <Chart 
                  key={`${theme.palette.mode}-${tabIndex}`}
                  options={chartConfig.options}
                  series={dailySeries}
                  type={chartConfig.type}
                  height={320}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Current Distribution Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, '&:last-child': { pb: 3.5 } }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Today's Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Current message state breakdown
                </Typography>
              </Box>

              {/* Donut Chart Render */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, minHeight: 280 }}>
                <Chart 
                  key={theme.palette.mode}
                  options={donutOptions}
                  series={donutSeries}
                  type="donut"
                  width="100%"
                  height={280}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
