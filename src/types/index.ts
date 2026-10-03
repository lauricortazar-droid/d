export type Role = 'ADMIN' | 'DIRECTOR';

export type FGDLLZone = 'Jaguar' | 'Tiburón' | 'Delfín' | 'Colibrí' | 'Águila';

export type OrganizationType = 
  | 'Grupo Tradicional' 
  | 'Centro de Rehabilitación' 
  | 'Albergue y Residencia' 
  | 'Casa de Medio Camino' 
  | 'Comité de Distrito / Zonal' 
  | 'Fraternidad';

export type PaperSize = 'Carta' | 'Oficio' | 'A4' | 'A5' | 'Cartel_08x12' | 'Cartel_12x18' | 'Redes_1080x1080' | 'Redes_1080x1350' | 'Redes_1080x1920' | 'Personalizado';

export type Orientation = 'portrait' | 'landscape';

export type TemplateStatus = 'borrador' | 'revision' | 'publicado' | 'archivado';

export type StyleThemeId = 'fgdll_oficial' | 'formal_sobrio' | 'minimalista' | 'tradicional' | 'centro_salud' | 'blanco_negro';

export interface StyleTheme {
  id: StyleThemeId;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  titleFont: string;
  bodyFont: string;
  headerBorder: boolean;
  watermarkOpacity: number;
}

export interface CenterProfile {
  id: string;
  officialName: string;
  shortName: string;
  logoUrl: string;
  customLogoData?: string;
  orgType: OrganizationType;
  zone: FGDLLZone;
  address: string;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  email: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  website: string;
  directorName: string;
  directorRole: string;
  schedules: string;
  briefDescription: string;
  motto: string;
  folioPrefix: string;
  currentFolioNumber: number;
}

export type BlockType = 
  | 'header' 
  | 'title' 
  | 'subtitle' 
  | 'paragraph' 
  | 'table' 
  | 'list' 
  | 'signature' 
  | 'separator' 
  | 'official_seal' 
  | 'notice_box'
  | 'footer';

export interface TableRow {
  id: string;
  cells: string[];
}

export interface Block {
  id: string;
  type: BlockType;
  label: string;
  content?: string;
  isEditableByDirector: boolean; // if false, director cannot edit (locked)
  helperText?: string;
  
  // Table specific
  tableHeaders?: string[];
  tableRows?: TableRow[];
  
  // List specific
  listItems?: string[];
  isNumberedList?: boolean;

  // Signatures specific
  signatures?: {
    roleTitle: string;
    personName: string;
    personCharge: string;
  }[];

  // Styling options per block
  alignment?: 'left' | 'center' | 'right' | 'justify';
  isBold?: boolean;
  isItalic?: boolean;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  textColor?: string;
}

export interface TemplateVersion {
  version: string;
  date: string;
  adminName: string;
  changeSummary: string;
  blocksSnapshot: Block[];
}

export interface MasterTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  updatedAt: string;
  size: PaperSize;
  orientation: Orientation;
  themeId: StyleThemeId;
  status: TemplateStatus;
  isFavorite?: boolean;
  zoneScope?: 'TODAS' | FGDLLZone;
  thumbnailPlaceholder?: string;
  
  // Margins in mm
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;

  // Layout toggles
  showHeader: boolean;
  showFooter: boolean;
  showWatermark: boolean;
  watermarkType?: 'crest' | 'zone' | 'custom';
  
  // Blocks
  blocks: Block[];
  
  // Version history
  versionHistory: TemplateVersion[];
}

export interface SavedDocument {
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  title: string;
  centerId: string;
  centerName: string;
  directorName: string;
  createdAt: string;
  updatedAt: string;
  status: 'borrador' | 'finalizado' | 'archivado';
  folio: string;
  customValues: Record<string, any>; // maps block.id to user entered content/rows/etc
  size: PaperSize;
  orientation: Orientation;
  themeId: StyleThemeId;
}

export interface NormalizationDiff {
  originalText: string;
  normalizedText: string;
  improvements: string[];
  grammarFixesCount: number;
  structureNotes: string;
}
