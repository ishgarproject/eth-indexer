const eventNames = ['Transfer', 'Approval', 'ApprovalForAll'] as const;
export type ERC721EventNames = typeof eventNames[number];
export const isERC721EventName = (eventName: any): eventName is ERC721EventNames => eventNames.includes(eventName);
