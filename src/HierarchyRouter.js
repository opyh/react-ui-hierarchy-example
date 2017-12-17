
  // Adds a given view controller on top of the stack.

  // pushViewController(pushedViewController: ViewController<*, *>, animated: boolean = false) {
  //   if (this.viewControllers.indexOf(pushedViewController) !== -1) {
  //     throw new Error('View controller cannot be pushed twice on stack.');
  //   }

  //   pushedViewController.navigationController.set(this);

  //   const push = () => {
  //     this.viewControllers.push(pushedViewController);
  //     this.topViewController.set(pushedViewController);
  //     return this.viewControllerDependency.changed();
  //   };

  //   if (animated) {
  //     pushedViewController.viewIsAnimated.set(false);
  //     Tracker.flush();
  //     this.blockUI();
  //     this._layoutViewControllers(this.viewControllers.concat(pushedViewController));
  //     push();
  //     this.viewControllers.forEach(c => c.viewIsAnimated.set(true));
  //     Meteor.defer(() => {
  //       this._layoutAllViewControllers();
  //       Meteor.setTimeout(() => this._layoutAllViewControllers(), 50);
  //       Meteor.setTimeout(() => this.unblockUI(), 500);
  //     });
  //   } else {
  //     push();
  //   }
  // }


  // Removes the top view controller from the stack.

  // popViewController(animated: boolean = false) {
  //   if (this.viewControllers.length === 1) {
  //     throw new Error('Can\'t pop root view controller.');
  //   }

  //   const poppedViewController = this.viewControllers[this.viewControllers.length - 1];

  //   const pop = () => {
  //     this.topViewController.get().navigationController.set(null);
  //     this.topViewController.get().tabBarController.set(null);
  //     this.viewControllers.pop();
  //     const newTopViewController = this.viewControllers[this.viewControllers.length - 1];
  //     return this.topViewController.set(newTopViewController);
  //   };

  //   if (animated) {
  //     this.blockUI();
  //     this.viewControllers.forEach(c => c.viewIsAnimated.set(true));
  //     pop();
  //     Meteor.defer(() => {
  //       this._layoutViewControllers(this.viewControllers.concat(poppedViewController));
  //       return Meteor.setTimeout(() => {
  //         this.unblockUI();
  //         return this.viewControllerDependency.changed();
  //       }, 500);
  //     });
  //   } else {
  //     pop();
  //     this.viewControllerDependency.changed();
  //     this._layoutAllViewControllers();
  //   }
  // }


  // popToViewControllerOrParentViewController(
  //   viewController: ViewController<*, *>,
  //   parentViewController: ViewController<*, *>,
  //   animated: boolean = true
  // ) {
  //   if (this.state.viewControllers.includes(viewController)) {
  //     this.popToViewController(viewController, animated);
  //     return;
  //   }
  //   this.popToViewController(parentViewController, animated);
  // }


  // // Removes all view controllers from the top of the stack until the
  // // given controller is on top of the stack.

  // popToViewController(viewController: ViewController<*, *>, animated: boolean): void {
  //   if (!this.viewControllers.includes(viewController)) {
  //     throw new Error('Can\'t pop to a view controller that is not on the stack.');
  //   }

  //   if (this.isShowingRootViewController()) {
  //     this._layoutAllViewControllers();
  //     return;
  //   }

  //   while (this.topViewController.get() !== viewController) {
  //     this.popViewController(animated);
  //   }
  // }