import { Icons } from './icons';

interface NodeIconProps {
  iconClass: string;
  tagName: string;
}

export const NodeIcon = ({ iconClass, tagName: preprocessedTagName }: NodeIconProps) => {
  const tagName = preprocessedTagName.toUpperCase();

  if (tagName === 'H1') {
    return <Icons.H1 className={iconClass} data-oid="5e24aede2f" />;
  } else if (tagName === 'H2') {
    return <Icons.H2 className={iconClass} data-oid="e1b8271bfb" />;
  } else if (tagName === 'H3') {
    return <Icons.H3 className={iconClass} data-oid="2ee86e1be8" />;
  } else if (tagName === 'H4') {
    return <Icons.H4 className={iconClass} data-oid="1553e22879" />;
  } else if (tagName === 'H5') {
    return <Icons.H5 className={iconClass} data-oid="e66f4a7c97" />;
  } else if (tagName === 'H6') {
    return <Icons.H6 className={iconClass} data-oid="a5a7ba2b60" />;
  } else if (tagName === 'P') {
    return <Icons.Pilcrow className={iconClass} data-oid="f584714ddf" />;
  } else if (['STRONG', 'EM', 'SPAN', 'I'].includes(tagName)) {
    return <Icons.Text className={iconClass} data-oid="472e6df632" />;
  } else if (tagName === 'A') {
    return <Icons.Link className={iconClass} data-oid="6e437c0112" />;
  } else if (['IMG', 'SVG'].includes(tagName)) {
    return <Icons.Image className={iconClass} data-oid="aad40d8d18" />;
  } else if (tagName === 'VIDEO') {
    return <Icons.Video className={iconClass} data-oid="b5c882a373" />;
  } else if (tagName === 'IFRAME') {
    return <Icons.Frame className={iconClass} data-oid="97b9b4de4c" />;
  } else if (tagName === 'BUTTON') {
    return <Icons.Button className={iconClass} data-oid="57a8163232" />;
  } else if (tagName === 'INPUT') {
    return <Icons.Input className={iconClass} data-oid="83fb347085" />;
  } else if (['UL', 'OL'].includes(tagName)) {
    return <Icons.ListBullet className={iconClass} data-oid="780efbca82" />;
  } else if (tagName === 'SECTION') {
    return <Icons.Section className={iconClass} data-oid="d673b19315" />;
  } else if (tagName === 'DIV') {
    return <Icons.Box className={iconClass} data-oid="f974ce18e3" />;
  } else if (['TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD'].includes(tagName)) {
    return <Icons.ViewGrid className={iconClass} data-oid="ac2b8c59c7" />;
  } else if (tagName === 'FORM') {
    return <Icons.ViewHorizontal className={iconClass} data-oid="d42753de4c" />;
  } else if (['SELECT', 'OPTION'].includes(tagName)) {
    return <Icons.DropdownMenu className={iconClass} data-oid="e47b846013" />;
  } else if (tagName === 'TEXTAREA') {
    return <Icons.ViewVertical className={iconClass} data-oid="5fa396f638" />;
  } else if (tagName === 'CANVAS') {
    return <Icons.PencilPaper className={iconClass} data-oid="29c5c46df8" />;
  } else if (tagName === 'BODY') {
    return <Icons.Desktop className={iconClass} data-oid="e08081e5bf" />;
  } else if (tagName === 'COMPONENT') {
    return <Icons.Component className={iconClass} data-oid="0f960811c2" />;
  } else {
    return <Icons.Frame className={iconClass} data-oid="6042e75b17" />;
  }
};