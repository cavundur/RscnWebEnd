import useSWR from 'swr';
import * as wp from '@/lib/api/wordpress';

const fetcher = async (url: string) => {
  const [endpoint, slug] = url.split('?');
  
  switch (endpoint) {
    case 'posts':
      return await wp.getPosts();
    case 'post':
      return await wp.getPost(slug);
    case 'pages':
      return await wp.getPages();
    case 'page':
      return await wp.getPage(slug);
    case 'services':
      return await wp.getServices();
    case 'projects':
      return await wp.getProjects();
    case 'menu':
      return await wp.getMenuItems(slug);
    default:
      throw new Error(`Unknown endpoint: ${endpoint}`);
  }
};

export function usePosts() {
  const { data, error, isLoading } = useSWR('posts', fetcher);
  
  return {
    posts: data,
    isLoading,
    isError: error
  };
}

export function usePost(slug: string) {
  const { data, error, isLoading } = useSWR(`post?${slug}`, fetcher);
  
  return {
    post: data,
    isLoading,
    isError: error
  };
}

export function usePage(slug: string) {
  const { data, error, isLoading } = useSWR(`page?${slug}`, fetcher);
  
  return {
    page: data,
    isLoading,
    isError: error
  };
}

export function useServices() {
  const { data, error, isLoading } = useSWR('services', fetcher);
  
  return {
    services: data,
    isLoading,
    isError: error
  };
}

export function useProjects() {
  const { data, error, isLoading } = useSWR('projects', fetcher);
  
  return {
    projects: data,
    isLoading,
    isError: error
  };
}

export function useMenu(location: string) {
  const { data, error, isLoading } = useSWR(`menu?${location}`, fetcher);
  
  return {
    menuItems: data,
    isLoading,
    isError: error
  };
} 