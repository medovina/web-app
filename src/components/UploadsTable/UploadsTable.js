import React, { PropTypes } from 'react';
import prettyBytes from 'pretty-bytes';
import Icon from 'react-fontawesome';
import { Table, Button, ButtonGroup } from 'react-bootstrap';

const UploadsTable = ({
  uploadingFiles = [],
  attachedFiles = [],
  failedFiles = [],
  removedFiles = [],
  removeFile,
  returnFile,
  removeFailedFile,
  retryUploadFile
}) => (
  <Table responsive>
    <thead>
      <tr>
        <th></th>
        <th>Název soboru</th>
        <th>Velikost souboru</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {attachedFiles.map(
        payload =>
          <tr key={'attached-' + payload.name}>
            <td>
              <Icon name='check' className='text-success text-bold' />
            </td>
            <td>{payload.name}</td>
            <td>{prettyBytes(payload.file.size)}</td>
            <td>
              <Button bsSize='xs' bsStyle='default' onClick={() => removeFile(payload)}>
                <Icon name='trash' />
              </Button>
            </td>
          </tr>
      )}

      {uploadingFiles.map(
        payload =>
          <tr key={'uploading-' + payload.name}>
            <td>
              <Icon name='circle-o' spin />
            </td>
            <td>{payload.name}</td>
            <td>{prettyBytes(payload.file.size)}</td>
            <td />
          </tr>
      )}

      {failedFiles.map(
        payload =>
          <tr key={'failed-' + payload.name}>
            <td>
              <Icon name='exclamation-triangle' className='text-danger' />
            </td>
            <td>{payload.name}</td>
            <td>{prettyBytes(payload.file.size)}</td>
            <td>
              <ButtonGroup>
                <Button bsSize='xs' bsStyle='default' onClick={() => removeFailedFile(payload)}>
                  <Icon name='trash' />
                </Button>
                <Button bsSize='xs' bsStyle='default' onClick={() => retryUploadFile(payload)}>
                  <Icon name='refresh' />
                </Button>
              </ButtonGroup>
            </td>
          </tr>
      )}

      {removedFiles.map(
        payload =>
          <tr key={'removed' + payload.name}>
            <td>
              <Icon name='trash' className='text-warning' />
            </td>
            <td>{payload.name}</td>
            <td>{prettyBytes(payload.file.size)}</td>
            <td>
              <ButtonGroup>
                <Button bsSize='xs' bsStyle='default' onClick={() => returnFile(payload)}>
                  <Icon name='refresh' />
                </Button>
              </ButtonGroup>
            </td>
          </tr>
      )}
    </tbody>
  </Table>
);

UploadsTable.propTypes = {
  uploadingFiles: PropTypes.array.isRequired,
  attachedFiles: PropTypes.array.isRequired,
  failedFiles: PropTypes.array.isRequired,
  removeFile: PropTypes.func.isRequired,
  removeFailedFile: PropTypes.func.isRequired,
  retryUploadFile: PropTypes.func.isRequired,
  returnFile: PropTypes.func.isRequired
};

export default UploadsTable;