import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/core/store/authSlice";
import serviceReducer from "@/widgets/services/model/service.slice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      service: serviceReducer,
    },
    devTools: process.env.NEXT_PUBLIC_APP_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
