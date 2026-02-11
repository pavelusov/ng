"use client";

import {
  Box,
  Chip,
  Container,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { legalServices } from "@/widgets/services/model/legalServices";
import { MainServices } from "@/widgets/services/ui/MainServices";

export const Services = () => {
  const cardSx = {
    height: "100%",
    p: { xs: 2.5, md: 3 },
    borderRadius: 0.3,
    borderColor: "divider",
    bgcolor: "background.paper",
    backgroundImage:
      "linear-gradient(180deg, rgba(127,127,127,0.06) 0%, rgba(127,127,127,0.00) 65%)",
    boxShadow: "0 18px 45px rgba(0,0,0,0.06)",
    transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 24px 65px rgba(0,0,0,0.10)",
      borderColor: "rgba(127,127,127,0.45)",
    },
  } as const;

  return (
    <Box
      component="section"
      id="services"
      sx={{
        py: { xs: 7, md: 10 },
        bgcolor: "background.default",
      }}
    >
      <Container>
        <Stack spacing={{ xs: 3, md: 4 }}>
          {/* <Stack spacing={1}>
            <Typography
              component="h2"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.02em",
                fontSize: { xs: 34, sm: 42, md: 52 },
                lineHeight: 1.05,
                textWrap: "balance",
              }}
            >
              Услуги
            </Typography>
            <Typography color="text.secondary">
              Работаем с земельными участками: от оформления документов до представительства в суде.
            </Typography>
          </Stack> */}

          <MainServices />

          <Paper variant="outlined" sx={cardSx}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography component="h3" sx={{ fontWeight: 850, fontSize: 22 }} color="primary">
                  Юридические услуги
                </Typography>
                <Chip
                  size="small"
                  label="Юридические"
                  sx={{
                    fontWeight: 700,
                    bgcolor: "rgba(127,127,127,0.10)",
                    border: "1px solid rgba(127,127,127,0.18)",
                  }}
                />
              </Stack>

              <List
                dense
                sx={{
                  p: 0,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  columnGap: { xs: 0, sm: 2 },
                }}
              >
                {legalServices.map((title) => (
                  <ListItem
                    key={title}
                    disableGutters
                    sx={{
                      py: 0.75,
                      pr: { xs: 0, sm: 1 },
                      alignItems: "flex-start",
                      borderTop: "1px solid",
                      borderColor: "divider",
                      "&:nth-of-type(-n+1)": { borderTop: "none" },
                      "@media (min-width:600px)": {
                        // In 2 columns, remove top border for first row
                        "&:nth-of-type(-n+2)": { borderTop: "none" },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 24, mt: "7px" }}>
                      <Box
                        aria-hidden
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "secondary.main",
                          boxShadow: "0 0 0 3px rgba(0,0,0,0.04)",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={title}
                      primaryTypographyProps={{
                        sx: { fontWeight: 600, lineHeight: 1.25 },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};
