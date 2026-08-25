import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  CloudChiprProjectPage,
  DesignTalentPage,
  DesignerPage,
  HotelApartmentsProjectPage,
  HomePage,
  LetsTalkPage,
  MaterialExchangePhotoLabProjectPage,
  MaterialExchangeProjectPage,
  PublicWorkPage,
  SchoolPage,
  SecurionProjectPage,
  StoryPage
} from "../davit-wireframe/DavitWireframe";
import "../davit-wireframe/davitWireframe.css";

const meta = {
  title: "MVP Pages",
  parameters: {
    layout: "fullscreen"
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const HomeAm: Story = {
  name: "/am - Home",
  render: () => <HomePage />
};

export const Designer: Story = {
  name: "/am/designer - Pedanyan",
  render: () => <DesignerPage />
};

export const DesignTalent: Story = {
  name: "/am/design-talent alias",
  render: () => <DesignTalentPage />
};

export const Story: Story = {
  name: "/am/story alias",
  render: () => <StoryPage />
};

export const School: Story = {
  name: "/am/school",
  render: () => <SchoolPage />
};

export const PublicWork: Story = {
  name: "/am/public-work - Public",
  render: () => <PublicWorkPage />
};

export const LetsTalk: Story = {
  name: "/am/lets-talk",
  render: () => <LetsTalkPage />
};

export const ProjectCloudchipr: Story = {
  name: "/am/projects/cloudchipr",
  render: () => <CloudChiprProjectPage />
};

export const ProjectMaterialExchange: Story = {
  name: "/am/projects/material-exchange",
  render: () => <MaterialExchangeProjectPage />
};

export const ProjectSecurion: Story = {
  name: "/am/projects/securion",
  render: () => <SecurionProjectPage />
};

export const ProjectMaterialExchangePhotoLab: Story = {
  name: "/am/projects/material-exchange-photo-lab",
  render: () => <MaterialExchangePhotoLabProjectPage />
};

export const ProjectHotelApartments: Story = {
  name: "/am/projects/hotel-apartments",
  render: () => <HotelApartmentsProjectPage />
};
