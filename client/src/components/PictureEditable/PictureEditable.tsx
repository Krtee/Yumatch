import { PictureEditableProps } from "./PictureEditable.types";
import "./PictureEditableStyles.scss";

const PictureEditable = ({ photo, onUpload }: PictureEditableProps) => {
  return (
    <div className="pic-wrapper">
      <img className="user-picture" src={photo} alt="" />
    </div>
  );
};

export default PictureEditable;
