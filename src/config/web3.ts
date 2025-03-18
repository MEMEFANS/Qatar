import { configureChains, createConfig } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';

const { chains, publicClient } = configureChains(
  [bsc],
  [publicProvider()]
);

export const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
  ],
  publicClient,
});
