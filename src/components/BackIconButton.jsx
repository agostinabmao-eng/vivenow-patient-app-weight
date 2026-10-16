import Icon from './Icon';
import IconButton from './IconButton';

/** The small arrow-left header button used in place of a full-width "Back"
 * button on task screens and sub-screens — frees up the footer for the
 * screen's own primary action (Save, Finish, etc). */
export default function BackIconButton({ onClick }) {
  return (
    <IconButton variant="ghost" label="Back" title="Back" onClick={onClick}>
      <Icon name="arrow-left" size={22} />
    </IconButton>
  );
}
