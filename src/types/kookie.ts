export type Service = {
  title: string;
  intro: string;
  items: string[];
};

export type WorkItem = {
  title: string;
  tags: string[];
  image: string;
  video?: string;
  href: string;
};

export type ContactOffice = {
  name: string;
  address: string[];
  email: string;
  phone?: string;
};
