import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    }),
    ...renderOptions
  }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
