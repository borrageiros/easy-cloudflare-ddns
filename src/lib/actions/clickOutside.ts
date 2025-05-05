// Action to detect clicks outside of an element
export function clickOutside(node: HTMLElement, params: { callback: () => void, exclude?: HTMLElement }) {
  const { callback, exclude } = params;
  
  const handleClick = (event: MouseEvent) => {
    if (
      node && 
      !node.contains(event.target as Node) && 
      !event.defaultPrevented &&
      !(exclude && exclude.contains(event.target as Node))
    ) {
      callback();
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    update(newParams: { callback: () => void, exclude?: HTMLElement }) {
      Object.assign(params, newParams);
    },
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
} 