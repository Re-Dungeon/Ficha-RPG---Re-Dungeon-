import React from 'react';
import PropTypes from 'prop-types';

import { CompanheiroBadge, CompanheiroCardButton, CompanheiroImagem, CompanheiroNome } from './styles';

const CompanheiroCard = ({ personagem, badge, onClick }) => (
  <CompanheiroCardButton type="button" onClick={onClick}>
    <CompanheiroImagem>
      {personagem.linkImagem ? <img src={personagem.linkImagem} alt={personagem.nome} /> : 'Sem imagem'}
    </CompanheiroImagem>
    {badge && <CompanheiroBadge>{badge}</CompanheiroBadge>}
    <CompanheiroNome>{personagem.nome}</CompanheiroNome>
  </CompanheiroCardButton>
);

CompanheiroCard.propTypes = {
  personagem: PropTypes.object.isRequired,
  badge: PropTypes.string,
  onClick: PropTypes.func.isRequired,
};

CompanheiroCard.defaultProps = {
  badge: null,
};

export default CompanheiroCard;
