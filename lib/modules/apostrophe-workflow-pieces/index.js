var _ = require('@sailshq/lodash');

module.exports = {

  improve: 'apostrophe-pieces',

  canEditTrash: true,

  beforeConstruct: function(self, options) {

    function onlyIf(type) {
      return self.apos.modules['apostrophe-workflow'].includeType(type);
    }

    options.addBatchOperations = [
      {
        name: 'submit',
        route: 'apostrophe-workflow:submit',
        label: 'Submit',
        buttonLabel: 'Submit',
        onlyIf: onlyIf
      },
      {
        name: 'commit',
        route: 'apostrophe-workflow:batch-commit',
        label: 'Commit',
        buttonLabel: 'Commit',
        onlyIf: onlyIf
      },
      {
        name: 'force-export',
        route: 'apostrophe-workflow:batch-force-export',
        label: 'Force Export',
        buttonLabel: 'Force Export',
        onlyIf: onlyIf
      },
      {
        name: 'revert-to-live',
        route: 'apostrophe-workflow:batch-revert-to-live',
        label: 'Revert',
        buttonLabel: 'Revert to Live',
        onlyIf: onlyIf
      }
    ].concat(options.addBatchOperations || []);

  },

  construct: function(self, options) {

    var superGetEditControls = self.getEditControls;
    self.getEditControls = function(req) {
      return upgradeControls(req, superGetEditControls(req), 'edit');
    };

    var superGetCreateControls = self.getCreateControls;
    self.getCreateControls = function(req) {
      return upgradeControls(req, superGetCreateControls(req), 'create');
    };

    function upgradeControls(req, controls, verb) {
      var workflow = self.apos.modules['apostrophe-workflow'];
      if (!workflow.includeType(self.name)) {
        // Not subject to workflow
        return controls;
      }
      var save = _.find(controls, { action: 'save' });
      if (save) {
        save.label = 'Save Draft';
      }

      controls.push({
        type: 'dropdown',
        label: 'Workflow',
        name: 'workflow',
        dropdownOptions: {
          direction: 'down'
        },
        // Frontend takes care of visibility decisions for these
        items: [
          {
            label: 'Submit',
            action: 'workflow-submit'
          },
          {
            label: 'Commit',
            action: 'workflow-commit'
          }
        ].concat((verb === 'edit')
          ? [
            {
              label: 'History',
              action: 'workflow-history'
            }
          ] : []
        ).concat(workflow.localized
          ? [
            {
              label: 'Force Export',
              action: 'workflow-force-export'
            }
          ] : []
        )
      });
      return controls;
    }
  }
};
