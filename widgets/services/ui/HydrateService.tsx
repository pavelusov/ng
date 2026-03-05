"use client";
import type { ServiceDto } from "@/entities/service";
import { FC, useEffect } from "react";
import { useAppDispatch } from "@/core/store/hooks";
import { setServices } from "@/widgets/services/model/service.slice";

type Props = {
  initialServices: ServiceDto[];
};

export const HydrateService: FC<Props> = ({ initialServices }) => {
    const dispatch = useAppDispatch();
    
    useEffect(() => {
        dispatch(setServices(initialServices));
    }, [dispatch, initialServices]);

    return null;
};
