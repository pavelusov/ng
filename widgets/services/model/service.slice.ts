import { ServiceRecord } from "@/entities/service";
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/core/store/store";

interface ServiceState {
  services: ServiceRecord[];
}

const initialState: ServiceState = {
  services: [],
};

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<ServiceRecord[]>) => {
      state.services = action.payload;
    },
  },
});

export const { setServices } = serviceSlice.actions;

const selectServiceState = (state: RootState): ServiceState => state.service;

export const getServices = createSelector([selectServiceState], (state) => state.services);
export const getMainServices = createSelector([getServices], (services) =>
  services.filter((service) => service.category === "main")
);
export const getLegalServices = createSelector([getServices], (services) =>
  services.filter((service) => service.category === "legal")
);

export default serviceSlice.reducer;
