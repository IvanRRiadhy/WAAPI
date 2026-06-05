import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../utils/axios';


export interface IntegrationItem {
    id: string;
    name: string;
    active: boolean;
    apiKey: string;
    tenantId: string;
}

const INTEGRATION_API_URL = '/api/apikeys';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useIntegration(enabled: boolean = true) {
    return useQuery({
        queryKey: ['integration-list'],
        queryFn: async () => {
            await delay(100);
            const response = await axiosServices.get(INTEGRATION_API_URL);
            console.log("Integration response: ", response.data)
            return response.data.collection as IntegrationItem[];
        },
        enabled,
        staleTime: 5_000,
        gcTime: 5 * 60_000,
    });
}

// ✅ Create API Key
export function useCreateApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            await delay(100);
            const response = await axiosServices.post(INTEGRATION_API_URL, { name });
            return response.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integration-list'] });
        },
    });
}

// ✅ Delete API Key
export function useDeleteApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await delay(100);
            await axiosServices.delete(`${INTEGRATION_API_URL}/${id}`);
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integration-list'] });
        },
    });
}

// ✅ Assign Agent
export function useAssignAgent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { id: string; agentId: string }) => {
            await delay(100);
            const body = {
                agentId: payload.agentId
            };
            await axiosServices.post(`${INTEGRATION_API_URL}/${payload.id}/agents`, body);
        },

        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['integration-list'] });
            queryClient.invalidateQueries({ queryKey: ['integration-agents', variables.id] });
        },
    });
}

export function useIntegrationAgents(id: string){
    return useQuery({
        queryKey: ['integration-agents', id],
        queryFn: async () => {
            await delay(100);
            const response = await axiosServices.get(`${INTEGRATION_API_URL}/${id}/agents`);
            return response.data;
        },
        staleTime: 5_000,
        gcTime: 5 * 60_000,
    });
}