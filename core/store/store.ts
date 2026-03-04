import { configureStore } from "@reduxjs/toolkit";

const placeholderReducer = (state: Record<string, never> = {}) => state;

export const makeStore = () =>
  configureStore({
    reducer: placeholderReducer,
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
